# SmartHealth Stress Prediction - Production REST API Backend

A production-ready, high-performance REST API backend built with **FastAPI**, **Pydantic**, **Scikit-learn**, **XGBoost**, and **SHAP** for real-time stress classification and Explainable AI (XAI) diagnostics.

---

## 🏗️ Architecture & Project Structure

```
backend/
│
├── main.py                     # FastAPI application entrypoint, CORS, routers & exception handlers
├── requirements.txt             # Python dependencies
├── .gitignore                   # Git ignore rules
├── README.md                    # Backend documentation & API guide
│
├── models/                      # Pre-trained ML model artifacts (.pkl)
│   ├── logistic_regression.pkl  # Hyperparameter-tuned Logistic Regression
│   ├── decision_tree.pkl        # Hyperparameter-tuned Decision Tree
│   ├── random_forest.pkl        # Hyperparameter-tuned Random Forest
│   └── xgboost.pkl              # Hyperparameter-tuned XGBoost Classifier
│
├── preprocessing/               # Pre-fitted preprocessing transformers (.pkl)
│   ├── encoder.pkl              # Fitted OrdinalEncoder for Activity Level
│   ├── scaler.pkl               # Fitted StandardScaler
│   ├── preprocessor.pkl         # Unified SmartHealthPreprocessor pipeline
│   └── background_sample.pkl    # Reference background sample for SHAP explainers
│
├── schemas/                     # Pydantic schemas & validation models
│   ├── __init__.py
│   └── prediction.py            # Input/output schemas with biological range checks
│
├── services/                    # Core business logic & model management
│   ├── __init__.py
│   ├── model_service.py         # Singleton model & explainer cache (loaded on startup)
│   └── prediction_service.py    # Multi-model inference & SHAP explanation logic
│
├── utils/                       # Feature definitions & data transformations
│   ├── __init__.py
│   └── preprocessing.py         # Deterministic data cleaner & preprocessor class
│
└── tests/                       # Automated test suite
    └── test_api.py              # Pytest suite testing all endpoints & validation rules
```

---

## ⚡ Key Highlights

1. **Zero Retraining at Runtime**: Models and transformers are pre-fitted, saved, and loaded once at startup into memory. No fitting occurs during inference.
2. **Deterministic Preprocessing**: Uses the exact `OrdinalEncoder` and column order from the training phase:
   - `['Heart Rate (BPM)', 'Blood Oxygen Level (%)', 'Step Count', 'Sleep Duration (hours)', 'Activity Level', 'Stress Level']`
3. **Multi-Model Inference**: Support for **Logistic Regression**, **Decision Tree**, **Random Forest**, and **XGBoost**.
4. **Explainable AI (SHAP)**: Dedicated `/explain` endpoint providing local feature attributions (positive/negative/neutral impact) without blocking normal prediction paths.
5. **Flexible Payload Validation**: Supports both original dataset column names (`"Heart Rate (BPM)"`) and snake_case keys (`"heart_rate_bpm"`).
6. **Graceful Error Handling**: Custom exception handlers prevent internal stack traces from leaking to clients and return structured JSON error payloads.

---

## 📊 Features & Realistic Bounds

| Feature Name | Key Aliases | Type | Valid Range / Categories | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Heart Rate (BPM)** | `heart_rate_bpm`, `heart_rate` | Float | `30.0` – `250.0` | Heart rate in beats per minute |
| **Blood Oxygen Level (%)** | `blood_oxygen_level`, `spo2` | Float | `50.0` – `100.0` | SpO2 saturation percentage |
| **Step Count** | `step_count`, `steps` | Float | `0.0` – `150,000.0` | Daily accumulated step count |
| **Sleep Duration (hours)** | `sleep_duration_hours`, `sleep_hours` | Float | `0.0` – `24.0` | Total sleep hours |
| **Activity Level** | `activity_level`, `activity` | String/Int | `'sedentary'` (0), `'active'` (1), `'highly active'` (2) | Categorical daily activity |
| **Stress Level** | `stress_level`, `stress` | Float | `0.0` – `10.0` | Reported stress score index |

---

## 🚀 Getting Started

### 1. Installation

Install dependencies using `pip` or `uv`:

```bash
# Using pip
pip install -r backend/requirements.txt

# Or using uv
uv pip install -r backend/requirements.txt
```

### 2. Run the API Server

Start the server using `uvicorn` or `uv`:

```bash
# Using uvicorn directly
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Or using python module
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Or using uv
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 3. Run Automated Tests

Execute the comprehensive test suite:

```bash
python -m pytest backend/tests/test_api.py -v
```

---

## 📡 API Endpoints Reference

### 1. Root & Health Check

#### `GET /`
**Response:**
```json
{
  "message": "SmartHealth Stress Prediction API",
  "status": "running"
}
```

#### `GET /health`
**Response:**
```json
{
  "status": "healthy"
}
```

---

### 2. Available Models List

#### `GET /models`
**Response:**
```json
{
  "models": [
    "logistic_regression",
    "decision_tree",
    "random_forest",
    "xgboost"
  ]
}
```

---

### 3. Single Model Prediction

#### `POST /predict?model=xgboost`
*Query Parameter:* `model` (Optional, defaults to `"xgboost"`). Allowed values: `logistic_regression`, `decision_tree`, `random_forest`, `xgboost`.

**Request Body:**
```json
{
  "Heart Rate (BPM)": 75,
  "Blood Oxygen Level (%)": 98,
  "Step Count": 5000,
  "Sleep Duration (hours)": 7,
  "Activity Level": "active",
  "Stress Level": 4
}
```
*(Alternatively, snake_case keys such as `"heart_rate_bpm": 75` are also supported)*

**Response (HTTP 200):**
```json
{
  "success": true,
  "model": "xgboost",
  "prediction": 0,
  "label": "Low Stress",
  "probability": 0.0001,
  "probabilities": {
    "Low Stress": 0.9999,
    "High Stress": 0.0001
  }
}
```

---

### 4. Multi-Model Comparison

#### `POST /predict/all`
Runs the same input through all 4 trained models simultaneously.

**Request Body:**
```json
{
  "Heart Rate (BPM)": 96,
  "Blood Oxygen Level (%)": 94,
  "Step Count": 2000,
  "Sleep Duration (hours)": 4,
  "Activity Level": "sedentary",
  "Stress Level": 10
}
```

**Response (HTTP 200):**
```json
{
  "success": true,
  "predictions": {
    "logistic_regression": {
      "prediction": 1,
      "label": "High Stress",
      "probability": 0.9984
    },
    "decision_tree": {
      "prediction": 1,
      "label": "High Stress",
      "probability": 1.0
    },
    "random_forest": {
      "prediction": 1,
      "label": "High Stress",
      "probability": 0.9850
    },
    "xgboost": {
      "prediction": 1,
      "label": "High Stress",
      "probability": 0.9999
    }
  }
}
```

---

### 5. Custom Input Testing & Risk Analysis

#### `POST /predict/custom?model=xgboost`
Provides a complete audit of raw input values, encoded feature values, prediction confidence, and practical health recommendations.

**Request Body:**
```json
{
  "Heart Rate (BPM)": 88,
  "Blood Oxygen Level (%)": 95,
  "Step Count": 3200,
  "Sleep Duration (hours)": 5.5,
  "Activity Level": "sedentary",
  "Stress Level": 7
}
```

**Response (HTTP 200):**
```json
{
  "success": true,
  "model": "xgboost",
  "input_data": {
    "Heart Rate (BPM)": 88.0,
    "Blood Oxygen Level (%)": 95.0,
    "Step Count": 3200.0,
    "Sleep Duration (hours)": 5.5,
    "Activity Level": "sedentary",
    "Stress Level": 7.0
  },
  "preprocessed_features": {
    "Heart Rate (BPM)": 88.0,
    "Blood Oxygen Level (%)": 95.0,
    "Step Count": 3200.0,
    "Sleep Duration (hours)": 5.5,
    "Activity Level": 0.0,
    "Stress Level": 7.0
  },
  "prediction": 1,
  "label": "High Stress",
  "probability": 0.9821,
  "confidence_percentage": 98.21,
  "risk_assessment": "Elevated Stress Detected (98.21% risk score). Recommendation: Reduce active load, hydrate, and practice relaxation."
}
```

---

### 6. Local SHAP Feature Attribution

#### `POST /explain?model=xgboost`
Computes local SHAP contributions for each individual feature, ranked from highest absolute impact to lowest.

**Request Body:**
```json
{
  "Heart Rate (BPM)": 96,
  "Blood Oxygen Level (%)": 94,
  "Step Count": 2000,
  "Sleep Duration (hours)": 4,
  "Activity Level": "sedentary",
  "Stress Level": 10
}
```

**Response (HTTP 200):**
```json
{
  "model": "xgboost",
  "prediction": 1,
  "label": "High Stress",
  "base_value": -2.314,
  "explanation": [
    {
      "feature": "Stress Level",
      "value": 10.0,
      "shap_value": 3.4521,
      "impact": "positive"
    },
    {
      "feature": "Sleep Duration (hours)",
      "value": 4.0,
      "shap_value": 2.1104,
      "impact": "positive"
    },
    {
      "feature": "Heart Rate (BPM)",
      "value": 96.0,
      "shap_value": 1.8412,
      "impact": "positive"
    },
    {
      "feature": "Blood Oxygen Level (%)",
      "value": 94.0,
      "shap_value": 0.9421,
      "impact": "positive"
    },
    {
      "feature": "Step Count",
      "value": 2000.0,
      "shap_value": 0.4512,
      "impact": "positive"
    },
    {
      "feature": "Activity Level",
      "value": 0.0,
      "shap_value": 0.1205,
      "impact": "positive"
    }
  ]
}
```

---

## 🔒 CORS Configuration

CORS is pre-configured to accept requests from frontend dev servers:
- `http://localhost:3000` (React / Next.js)
- `http://localhost:5173` (Vite / Svelte)
- `http://localhost:8501` (Streamlit)

To customize allowed origins in production, set the environment variable:
```bash
export ALLOWED_ORIGINS="https://my-app.domain.com,https://api.domain.com"
```
