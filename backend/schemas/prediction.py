"""
Pydantic Schemas for SmartHealth Health Risk Prediction API.

Defines input validation models with realistic biological bounds,
field aliases for flexible JSON payloads, and response models.
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ModelNameEnum(str, Enum):
    """Available trained machine learning models."""
    LOGISTIC_REGRESSION = "logistic_regression"
    DECISION_TREE = "decision_tree"
    RANDOM_FOREST = "random_forest"
    XGBOOST = "xgboost"


class ActivityLevelEnum(str, Enum):
    """Allowed activity level values."""
    SEDENTARY = "sedentary"
    ACTIVE = "active"
    HIGHLY_ACTIVE = "highly active"


class HealthDataInput(BaseModel):
    """
    Validated input data schema for SmartHealth Health Risk Prediction.

    Accepts both standard snake_case keys and original dataset column names.
    """
    heart_rate_bpm: float = Field(
        ...,
        alias="Heart Rate (BPM)",
        ge=30.0,
        le=250.0,
        description="Heart rate in beats per minute (BPM). Realistic range: 30-250.",
        json_schema_extra={"example": 75.0},
    )
    blood_oxygen_level: float = Field(
        ...,
        alias="Blood Oxygen Level (%)",
        ge=50.0,
        le=100.0,
        description="Blood oxygen saturation percentage (SpO2). Realistic range: 50-100%.",
        json_schema_extra={"example": 98.0},
    )
    step_count: float = Field(
        ...,
        alias="Step Count",
        ge=0.0,
        le=150000.0,
        description="Daily step count. Range: 0-150,000.",
        json_schema_extra={"example": 5000.0},
    )
    sleep_duration_hours: float = Field(
        ...,
        alias="Sleep Duration (hours)",
        ge=0.0,
        le=24.0,
        description="Sleep duration in hours. Range: 0-24.",
        json_schema_extra={"example": 7.0},
    )
    activity_level: Union[str, int, float] = Field(
        ...,
        alias="Activity Level",
        description="Activity level category ('sedentary', 'active', 'highly active' or numeric 0, 1, 2).",
        json_schema_extra={"example": "active"},
    )
    stress_level: float = Field(
        ...,
        alias="Stress Level",
        ge=0.0,
        le=10.0,
        description="Subjective or sensor-calculated stress level score on a scale of 0 to 10 as a contributing biomarker.",
        json_schema_extra={"example": 4.0},
    )

    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore",
        json_schema_extra={
            "example": {
                "Heart Rate (BPM)": 75.0,
                "Blood Oxygen Level (%)": 98.0,
                "Step Count": 5000.0,
                "Sleep Duration (hours)": 7.0,
                "Activity Level": "active",
                "Stress Level": 4.0,
            }
        },
    )

    @field_validator("activity_level", mode="before")
    @classmethod
    def validate_activity_level(cls, v: Any) -> Union[str, int, float]:
        """Validate activity level category or numeric code."""
        if isinstance(v, (int, float)):
            if int(v) not in (0, 1, 2):
                raise ValueError("Numeric activity level must be 0 (sedentary), 1 (active), or 2 (highly active).")
            return v
        if isinstance(v, str):
            cleaned = v.strip().lower().replace("_", " ")
            typos = {"actve": "active", "seddentary": "sedentary", "highlyactive": "highly active"}
            cleaned = typos.get(cleaned, cleaned)
            if cleaned not in ("sedentary", "active", "highly active"):
                raise ValueError(
                    f"Invalid activity level: '{v}'. Must be one of: 'sedentary', 'active', 'highly active' or 0, 1, 2."
                )
            return cleaned
        raise ValueError("Activity level must be a string or integer/float.")

    def to_raw_dict(self) -> Dict[str, Any]:
        """Convert to dictionary using original dataset feature names."""
        return {
            "Heart Rate (BPM)": self.heart_rate_bpm,
            "Blood Oxygen Level (%)": self.blood_oxygen_level,
            "Step Count": self.step_count,
            "Sleep Duration (hours)": self.sleep_duration_hours,
            "Activity Level": self.activity_level,
            "Stress Level": self.stress_level,
        }


# =====================================================================
# Response Schemas
# =====================================================================

class RootResponse(BaseModel):
    """Root endpoint response."""
    message: str = "SmartHealth AI Health Risk Prediction API"
    status: str = "running"


class HealthCheckResponse(BaseModel):
    """Health check endpoint response."""
    status: str = "healthy"


class ModelsListResponse(BaseModel):
    """Available models list response."""
    models: List[str]


class PredictionResponse(BaseModel):
    """Standard single-model health risk prediction response."""
    success: bool = True
    model: str
    prediction: int = Field(..., description="Predicted class index (0 for Low Health Risk, 1 for Elevated Health Risk)")
    label: str = Field(..., description="Human-readable prediction label")
    probability: float = Field(..., description="Confidence probability for the elevated health risk class")
    health_risk_score: Optional[float] = Field(None, description="Quantified health risk percentage (0-100)")
    risk_tier: Optional[str] = Field(None, description="Assigned risk tier: Low, Moderate, Elevated, or Critical")
    risk_assessment: Optional[str] = Field(None, description="Clinical advisory and health guidance message")
    probabilities: Optional[Dict[str, float]] = Field(
        None, description="Detailed probabilities for each class"
    )


class ModelPredictionDetail(BaseModel):
    """Prediction output for an individual model within multi-model prediction."""
    prediction: int
    label: Optional[str] = None
    probability: float
    health_risk_score: Optional[float] = None
    risk_tier: Optional[str] = None


class AllModelsPredictionResponse(BaseModel):
    """Response containing predictions from all four trained models."""
    success: bool = True
    predictions: Dict[str, ModelPredictionDetail]


class CustomPredictionResponse(BaseModel):
    """Detailed response for custom input health risk prediction testing."""
    success: bool = True
    model: str
    input_data: Dict[str, Any]
    preprocessed_features: Dict[str, float]
    prediction: int
    label: str
    probability: float
    confidence_percentage: float
    health_risk_score: Optional[float] = None
    risk_tier: Optional[str] = None
    risk_assessment: str


class FeatureExplanation(BaseModel):
    """Local SHAP contribution for a single feature."""
    feature: str
    value: float
    shap_value: float
    impact: str = Field(..., description="'positive' (increases health risk), 'negative' (decreases health risk), or 'neutral'")


class ExplanationResponse(BaseModel):
    """Local SHAP feature explanation response."""
    model: str
    prediction: int
    label: str
    base_value: Optional[float] = None
    explanation: List[FeatureExplanation]


class ErrorResponse(BaseModel):
    """Standard error response payload."""
    success: bool = False
    error: str
    detail: Optional[Any] = None
