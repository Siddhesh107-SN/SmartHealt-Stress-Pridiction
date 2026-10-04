"""
Comprehensive Test Suite for SmartHealth Health Risk Prediction Backend.

Tests all endpoints, input validations, model selection, SHAP explainability,
and error handling using FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.model_service import ModelService


@pytest.fixture(scope="session", autouse=True)
def setup_models():
    """Ensure models are loaded prior to testing."""
    service = ModelService.get_instance()
    service.load_artifacts()


@pytest.fixture
def client():
    """Create test client with lifespan context."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_health_payload_original():
    """Valid sample payload using original dataset column names."""
    return {
        "Heart Rate (BPM)": 75,
        "Blood Oxygen Level (%)": 98,
        "Step Count": 5000,
        "Sleep Duration (hours)": 7,
        "Activity Level": "active",
        "Stress Level": 4,
    }


@pytest.fixture
def sample_health_payload_snake():
    """Valid sample payload using standard snake_case keys."""
    return {
        "heart_rate_bpm": 85.0,
        "blood_oxygen_level": 97.0,
        "step_count": 8000.0,
        "sleep_duration_hours": 6.5,
        "activity_level": "sedentary",
        "stress_level": 7.0,
    }


def test_root_endpoint(client):
    """Test GET / returns identity and running status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "SmartHealth AI Health Risk Prediction API"
    assert data["status"] == "running"


def test_health_check(client):
    """Test GET /health returns healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_get_models(client):
    """Test GET /models lists all four available models."""
    response = client.get("/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    expected_models = {"logistic_regression", "decision_tree", "random_forest", "xgboost"}
    assert set(data["models"]) == expected_models


def test_predict_single_default(client, sample_health_payload_original):
    """Test POST /predict defaults to XGBoost."""
    response = client.post("/predict", json=sample_health_payload_original)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["model"] == "xgboost"
    assert data["prediction"] in (0, 1)
    assert data["label"] in ("Low Health Risk", "Elevated Health Risk", "Low Stress", "High Stress")
    assert 0.0 <= data["probability"] <= 1.0
    assert "health_risk_score" in data
    assert "risk_tier" in data


@pytest.mark.parametrize("model_name", [
    "logistic_regression",
    "decision_tree",
    "random_forest",
    "xgboost",
    ])
def test_predict_each_model(client, sample_health_payload_original, model_name):
    """Test POST /predict with each supported model query parameter."""
    response = client.post(f"/predict?model={model_name}", json=sample_health_payload_original)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["model"] == model_name
    assert data["prediction"] in (0, 1)
    assert 0.0 <= data["probability"] <= 1.0


def test_predict_snake_case_support(client, sample_health_payload_snake):
    """Test POST /predict works seamlessly with snake_case field names."""
    response = client.post("/predict", json=sample_health_payload_snake)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["prediction"] in (0, 1)


def test_predict_invalid_model_name(client, sample_health_payload_original):
    """Test POST /predict with invalid model name returns HTTP 400."""
    response = client.post("/predict?model=non_existent_model", json=sample_health_payload_original)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Invalid model" in data["error"]


def test_predict_validation_error_missing_field(client):
    """Test POST /predict returns HTTP 422 when required fields are missing."""
    incomplete_payload = {
        "Heart Rate (BPM)": 75,
        "Blood Oxygen Level (%)": 98,
        # Missing Step Count, Sleep Duration, Activity Level, Stress Level
    }
    response = client.post("/predict", json=incomplete_payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "Validation Error" in data["error"]


def test_predict_validation_error_invalid_value(client, sample_health_payload_original):
    """Test POST /predict returns HTTP 422 when out-of-range values are passed."""
    bad_payload = sample_health_payload_original.copy()
    bad_payload["Blood Oxygen Level (%)"] = 150  # SpO2 cannot exceed 100%
    response = client.post("/predict", json=bad_payload)
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False


def test_predict_all_models(client, sample_health_payload_original):
    """Test POST /predict/all runs prediction on all four models."""
    response = client.post("/predict/all", json=sample_health_payload_original)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "predictions" in data
    predictions = data["predictions"]
    for expected_model in ["logistic_regression", "decision_tree", "random_forest", "xgboost"]:
        assert expected_model in predictions
        assert predictions[expected_model]["prediction"] in (0, 1)
        assert 0.0 <= predictions[expected_model]["probability"] <= 1.0
        assert "health_risk_score" in predictions[expected_model]


def test_predict_custom_endpoint(client, sample_health_payload_original):
    """Test POST /predict/custom returns detailed feature transformations and health risk assessment."""
    response = client.post("/predict/custom", json=sample_health_payload_original)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "preprocessed_features" in data
    assert "risk_assessment" in data
    assert "confidence_percentage" in data
    assert "health_risk_score" in data
    assert "risk_tier" in data
    assert data["preprocessed_features"]["Activity Level"] == 1.0  # 'active' is encoded to 1.0


def test_explain_endpoint_xgboost(client, sample_health_payload_original):
    """Test POST /explain with XGBoost produces structured local SHAP explanations."""
    response = client.post("/explain?model=xgboost", json=sample_health_payload_original)
    assert response.status_code == 200
    data = response.json()
    assert data["model"] == "xgboost"
    assert data["prediction"] in (0, 1)
    assert "explanation" in data
    assert len(data["explanation"]) == 6  # 6 features

    for item in data["explanation"]:
        assert "feature" in item
        assert "value" in item
        assert "shap_value" in item
        assert item["impact"] in ("positive", "negative", "neutral")


@pytest.mark.parametrize("model_name", [
    "logistic_regression",
    "decision_tree",
    "random_forest",
])
def test_explain_endpoint_other_models(client, sample_health_payload_original, model_name):
    """Test POST /explain with other models."""
    response = client.post(f"/explain?model={model_name}", json=sample_health_payload_original)
    assert response.status_code == 200
    data = response.json()
    assert data["model"] == model_name
    assert len(data["explanation"]) == 6
