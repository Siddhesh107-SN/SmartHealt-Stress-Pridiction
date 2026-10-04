"""
Model Management Service.

Loads all pre-trained machine learning models and fitted preprocessing objects
once at application startup into memory. Provides safe lookup, validation,
and cached SHAP explainers.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
import joblib
import pandas as pd
import shap
from sklearn.base import BaseEstimator


# Base directory for backend assets
BACKEND_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BACKEND_DIR / "models"
PREPROCESSING_DIR = BACKEND_DIR / "preprocessing"


class ModelService:
    """
    Singleton service managing all ML model instances and preprocessing pipelines.
    """

    _instance: Optional["ModelService"] = None

    def __init__(self) -> None:
        self.models: Dict[str, Any] = {}
        self.preprocessor: Optional[Any] = None
        self.encoder: Optional[Any] = None
        self.scaler: Optional[Any] = None
        self.background_sample: Optional[pd.DataFrame] = None
        self._explainers: Dict[str, Any] = {}
        self.is_loaded: bool = False

    @classmethod
    def get_instance(cls) -> "ModelService":
        """Get or create singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_artifacts(self) -> None:
        """
        Load all models and preprocessors from disk once at startup.
        """
        model_files = {
            "logistic_regression": MODELS_DIR / "logistic_regression.pkl",
            "decision_tree": MODELS_DIR / "decision_tree.pkl",
            "random_forest": MODELS_DIR / "random_forest.pkl",
            "xgboost": MODELS_DIR / "xgboost.pkl",
        }

        # Load models
        for name, path in model_files.items():
            if not path.exists():
                # Check fallback in root directory for xgboost if needed
                root_fallback = BACKEND_DIR.parent / "Stress_Prediction_Model.pkl"
                if name == "xgboost" and root_fallback.exists():
                    self.models[name] = joblib.load(root_fallback)
                    continue
                raise FileNotFoundError(
                    f"Model file not found for '{name}' at path: {path}. Please ensure models are saved."
                )
            self.models[name] = joblib.load(path)

        # Load preprocessing artifacts
        encoder_path = PREPROCESSING_DIR / "encoder.pkl"
        scaler_path = PREPROCESSING_DIR / "scaler.pkl"
        preprocessor_path = PREPROCESSING_DIR / "preprocessor.pkl"
        background_path = PREPROCESSING_DIR / "background_sample.pkl"

        if encoder_path.exists():
            self.encoder = joblib.load(encoder_path)
        if scaler_path.exists():
            self.scaler = joblib.load(scaler_path)
        if preprocessor_path.exists():
            self.preprocessor = joblib.load(preprocessor_path)
        else:
            from backend.utils.preprocessing import SmartHealthPreprocessor
            self.preprocessor = SmartHealthPreprocessor(encoder=self.encoder)
            self.preprocessor.fit(None)

        if background_path.exists():
            self.background_sample = joblib.load(background_path)
        else:
            # Fallback background sample with typical baseline values
            self.background_sample = pd.DataFrame([
                {
                    "Heart Rate (BPM)": 72.0,
                    "Blood Oxygen Level (%)": 98.0,
                    "Step Count": 6000.0,
                    "Sleep Duration (hours)": 7.0,
                    "Activity Level": 1.0,
                    "Stress Level": 3.0,
                },
                {
                    "Heart Rate (BPM)": 95.0,
                    "Blood Oxygen Level (%)": 94.0,
                    "Step Count": 2000.0,
                    "Sleep Duration (hours)": 4.5,
                    "Activity Level": 0.0,
                    "Stress Level": 8.0,
                }
            ])

        self.is_loaded = True

    def get_model(self, model_name: str) -> Any:
        """
        Retrieve a loaded model by name. Raises ValueError if invalid.
        """
        normalized_name = model_name.strip().lower().replace(" ", "_").replace("-", "_")
        if normalized_name not in self.models:
            valid_models = list(self.models.keys())
            raise ValueError(
                f"Invalid model '{model_name}'. Available models are: {valid_models}"
            )
        return self.models[normalized_name]

    def get_all_models(self) -> Dict[str, Any]:
        """Return dictionary of all loaded models."""
        return self.models

    def get_available_models(self) -> List[str]:
        """Return list of available model names."""
        return list(self.models.keys())

    def get_preprocessor(self) -> Any:
        """Return the loaded fitted preprocessor."""
        if self.preprocessor is None:
            raise RuntimeError("Preprocessor has not been loaded.")
        return self.preprocessor

    def get_explainer(self, model_name: str) -> Any:
        """
        Retrieve or instantiate cached SHAP explainer for the specified model.
        """
        normalized_name = model_name.strip().lower().replace(" ", "_").replace("-", "_")
        model = self.get_model(normalized_name)

        if normalized_name not in self._explainers:
            if normalized_name in ("decision_tree", "random_forest", "xgboost"):
                self._explainers[normalized_name] = shap.TreeExplainer(model)
            elif normalized_name == "logistic_regression":
                bg = self.background_sample
                if bg is not None:
                    self._explainers[normalized_name] = shap.LinearExplainer(model, bg)
                else:
                    self._explainers[normalized_name] = shap.Explainer(model)
            else:
                self._explainers[normalized_name] = shap.Explainer(model)

        return self._explainers[normalized_name]
