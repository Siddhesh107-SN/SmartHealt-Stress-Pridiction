"""
Prediction and Explanation Business Logic Service.

Orchestrates input validation, preprocessing transform, model inference,
and local SHAP feature attribution for Health Risk Assessment.
"""

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from backend.schemas.prediction import (
    AllModelsPredictionResponse,
    CustomPredictionResponse,
    ExplanationResponse,
    FeatureExplanation,
    HealthDataInput,
    ModelPredictionDetail,
    PredictionResponse,
)
from backend.services.model_service import ModelService
from backend.utils.preprocessing import FEATURE_NAMES, LABEL_MAP


def calculate_risk_tier(score: float) -> str:
    """Classify health risk score (0-100) into 4 standardized tiers."""
    if score < 25.0:
        return "Low"
    elif score < 50.0:
        return "Moderate"
    elif score < 75.0:
        return "Elevated"
    else:
        return "Critical"


class PredictionService:
    """Service handling predictions and explanations across all models."""

    def __init__(self, model_service: Optional[ModelService] = None) -> None:
        self.model_service = model_service or ModelService.get_instance()

    def _preprocess_input(self, input_data: HealthDataInput) -> pd.DataFrame:
        """Transform input data into the exact DataFrame required by models."""
        preprocessor = self.model_service.get_preprocessor()
        raw_dict = input_data.to_raw_dict()
        return preprocessor.transform(raw_dict)

    def predict_single(
        self, input_data: HealthDataInput, model_name: str = "xgboost"
    ) -> PredictionResponse:
        """
        Run health risk inference using a single selected model.
        """
        model = self.model_service.get_model(model_name)
        X_df = self._preprocess_input(input_data)

        pred_array = model.predict(X_df)
        pred = int(pred_array[0])
        label = LABEL_MAP.get(pred, f"Class {pred}")

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_df)[0]
            prob_elevated = float(probs[1]) if len(probs) > 1 else float(probs[0])
            prob_dict = {
                LABEL_MAP.get(0, "Low Health Risk"): round(float(probs[0]), 4),
                LABEL_MAP.get(1, "Elevated Health Risk"): round(float(probs[1]), 4) if len(probs) > 1 else 0.0,
            }
        else:
            prob_elevated = float(pred)
            prob_dict = {
                LABEL_MAP.get(0, "Low Health Risk"): 1.0 - float(pred),
                LABEL_MAP.get(1, "Elevated Health Risk"): float(pred),
            }

        health_risk_score = round(prob_elevated * 100, 1) if pred == 1 else round(max(5.0, (1.0 - prob_elevated) * 100), 1)
        risk_tier = calculate_risk_tier(health_risk_score if pred == 1 else round(prob_elevated * 100, 1))
        
        if pred == 1:
            risk_assessment = (
                f"Elevated Physiological Health Risk Detected ({round(prob_elevated * 100, 1)}% risk score). "
                "Recommendation: Address physiological strain, schedule recovery intervals, and consult healthcare guidance."
            )
        else:
            risk_assessment = (
                f"Low Health Risk Baseline ({round((1 - prob_elevated) * 100, 1)}% optimal health score). "
                "Biometric vitals and autonomic indicators are in healthy adaptive zones."
            )

        return PredictionResponse(
            success=True,
            model=model_name,
            prediction=pred,
            label=label,
            probability=round(prob_elevated, 4),
            health_risk_score=round(prob_elevated * 100, 1),
            risk_tier=risk_tier,
            risk_assessment=risk_assessment,
            probabilities=prob_dict,
        )

    def predict_all(
        self, input_data: HealthDataInput
    ) -> AllModelsPredictionResponse:
        """
        Run the same input across all four available models and return comparison.
        """
        X_df = self._preprocess_input(input_data)
        all_models = self.model_service.get_all_models()
        predictions: Dict[str, ModelPredictionDetail] = {}

        for name, model in all_models.items():
            pred = int(model.predict(X_df)[0])
            label = LABEL_MAP.get(pred, f"Class {pred}")

            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(X_df)[0]
                prob_elevated = float(probs[1]) if len(probs) > 1 else float(probs[0])
            else:
                prob_elevated = float(pred)

            score = round(prob_elevated * 100, 1)
            tier = calculate_risk_tier(score)

            predictions[name] = ModelPredictionDetail(
                prediction=pred,
                label=label,
                probability=round(prob_elevated, 4),
                health_risk_score=score,
                risk_tier=tier,
            )

        return AllModelsPredictionResponse(
            success=True,
            predictions=predictions,
        )

    def predict_custom(
        self, input_data: HealthDataInput, model_name: str = "xgboost"
    ) -> CustomPredictionResponse:
        """
        Run custom input prediction with complete preprocessed feature breakdown and health risk scoring.
        """
        model = self.model_service.get_model(model_name)
        X_df = self._preprocess_input(input_data)

        pred = int(model.predict(X_df)[0])
        label = LABEL_MAP.get(pred, f"Class {pred}")

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_df)[0]
            prob_elevated = float(probs[1]) if len(probs) > 1 else float(probs[0])
        else:
            prob_elevated = float(pred)

        risk_score = round(prob_elevated * 100, 2)
        tier = calculate_risk_tier(risk_score)

        if pred == 1:
            risk_assessment = (
                f"Elevated Physiological Health Risk Detected ({risk_score}% risk score). "
                "Recommendation: Reduce cumulative physical load, hydrate, and consider routine clinical screening."
            )
        else:
            risk_assessment = (
                f"Low Health Risk Baseline ({round((1 - prob_elevated) * 100, 2)}% healthy score). "
                "Vitals, sleep duration, and activity levels reflect resilient autonomic stability."
            )

        preprocessed_dict = {col: float(X_df.iloc[0][col]) for col in X_df.columns}

        return CustomPredictionResponse(
            success=True,
            model=model_name,
            input_data=input_data.model_dump(by_alias=True),
            preprocessed_features=preprocessed_dict,
            prediction=pred,
            label=label,
            probability=round(prob_elevated, 4),
            confidence_percentage=risk_score,
            health_risk_score=risk_score,
            risk_tier=tier,
            risk_assessment=risk_assessment,
        )

    def explain_prediction(
        self, input_data: HealthDataInput, model_name: str = "xgboost"
    ) -> ExplanationResponse:
        """
        Generate local SHAP feature explanations for the health risk prediction.
        """
        model = self.model_service.get_model(model_name)
        X_df = self._preprocess_input(input_data)
        pred = int(model.predict(X_df)[0])
        label = LABEL_MAP.get(pred, f"Class {pred}")

        explainer = self.model_service.get_explainer(model_name)
        shap_result = explainer(X_df)

        raw_values = shap_result.values
        # Handle multi-class vs single margin SHAP shape
        if raw_values.ndim == 3:
            # Shape: (samples, features, classes) -> Select class 1 (Elevated Risk)
            sample_shap = raw_values[0, :, 1]
        elif raw_values.ndim == 2:
            # Shape: (samples, features)
            sample_shap = raw_values[0, :]
        else:
            sample_shap = np.asarray(raw_values).flatten()

        # Handle base value
        base_val: Optional[float] = None
        if hasattr(shap_result, "base_values"):
            base_vals = shap_result.base_values
            if isinstance(base_vals, (np.ndarray, list)):
                base_arr = np.asarray(base_vals)
                if base_arr.ndim == 2 and base_arr.shape[1] > 1:
                    base_val = round(float(base_arr[0, 1]), 4)
                elif base_arr.ndim >= 1:
                    base_val = round(float(base_arr.flatten()[0]), 4)
            elif isinstance(base_vals, (int, float, np.floating)):
                base_val = round(float(base_vals), 4)

        explanations: List[FeatureExplanation] = []
        for i, col in enumerate(FEATURE_NAMES):
            val = float(X_df.iloc[0][col])
            sv = float(sample_shap[i])
            impact = "positive" if sv > 0.0001 else ("negative" if sv < -0.0001 else "neutral")
            explanations.append(
                FeatureExplanation(
                    feature=col,
                    value=round(val, 2),
                    shap_value=round(sv, 4),
                    impact=impact,
                )
            )

        # Sort explanations by absolute contribution descending
        explanations.sort(key=lambda x: abs(x.shap_value), reverse=True)

        return ExplanationResponse(
            model=model_name,
            prediction=pred,
            label=label,
            base_value=base_val,
            explanation=explanations,
        )
