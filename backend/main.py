"""
SmartHealth AI - Physiological Health Risk Prediction REST API Backend.

Built with FastAPI, Pydantic, Scikit-learn, XGBoost, and SHAP.
"""

from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.schemas.prediction import (
    AllModelsPredictionResponse,
    CustomPredictionResponse,
    ErrorResponse,
    ExplanationResponse,
    HealthCheckResponse,
    HealthDataInput,
    ModelNameEnum,
    ModelsListResponse,
    PredictionResponse,
    RootResponse,
)
from backend.services.model_service import ModelService
from backend.services.prediction_service import PredictionService


# Base directories for static asset serving
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("smarthealth.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Loads ML models and preprocessors once at startup.
    """
    logger.info("Initializing SmartHealth Health Risk Prediction API...")
    try:
        model_service = ModelService.get_instance()
        model_service.load_artifacts()
        logger.info(
            "Successfully loaded all ML models: %s",
            model_service.get_available_models(),
        )
    except Exception as e:
        logger.error("Failed to load ML artifacts at startup: %s", str(e), exc_info=True)
        raise e
    yield
    logger.info("Shutting down SmartHealth Health Risk Prediction API...")


# Initialize FastAPI application
app = FastAPI(
    title="SmartHealth AI Health Risk Prediction API",
    description="""
    Production-ready REST API for real-time physiological health risk prediction and AI explainability.
    
    ### Features:
    * **Multi-Model Inference:** Logistic Regression, Decision Tree, Random Forest, and XGBoost.
    * **Health Risk Quantification:** Numerical risk score (0-100%) categorized into 4 risk tiers (Low, Moderate, Elevated, Critical).
    * **Instant Multi-Model Comparison:** Benchmark predictions across all models simultaneously with `/predict/all`.
    * **Explainable AI (XAI):** Local feature contribution attribution using SHAP with `/explain`.
    * **Biological Validation:** Pydantic schema validation with realistic clinical range checks and alias support.
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# =====================================================================
# CORS Configuration
# =====================================================================

allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8080",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# Global Exception Handlers
# =====================================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Clean JSON formatting for Pydantic input validation errors."""
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = err.get("msg", "Invalid value")
        errors.append({"field": field or "payload", "message": msg})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation Error: One or more input fields failed validation.",
            "detail": errors,
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle business logic / data validation value errors."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": str(exc),
            "detail": None,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle standard HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail if isinstance(exc.detail, str) else "HTTP Exception",
            "detail": exc.detail if not isinstance(exc.detail, str) else None,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all handler to avoid exposing internal server stack traces."""
    logger.error("Unhandled internal server error: %s", str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "An internal server error occurred while processing the request.",
            "detail": None,
        },
    )


# =====================================================================
# API Endpoints
# =====================================================================

@app.get(
    "/",
    response_model=RootResponse,
    summary="API Root Information / Frontend SPA",
    tags=["System"],
)
async def root(request: Request):
    """
    Root endpoint.
    Serves the built React frontend SPA if available, or returns API identity and status.
    """
    index_file = FRONTEND_DIST_DIR / "index.html"
    accept_header = request.headers.get("accept", "")

    # If frontend is built and request is not explicitly requesting JSON only, serve index.html
    if index_file.exists() and "application/json" not in accept_header:
        return FileResponse(index_file)

    return {
        "message": "SmartHealth AI Health Risk Prediction API",
        "status": "running",
    }


@app.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health Check",
    tags=["System"],
)
async def health_check() -> Dict[str, str]:
    """Health check endpoint for liveness and readiness monitoring."""
    model_service = ModelService.get_instance()
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifacts are not loaded yet.",
        )
    return {"status": "healthy"}


@app.get(
    "/models",
    response_model=ModelsListResponse,
    summary="List Available ML Models",
    tags=["Models"],
)
async def get_models() -> Dict[str, List[str]]:
    """Retrieve all available pre-trained ML models."""
    model_service = ModelService.get_instance()
    return {"models": model_service.get_available_models()}


@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict Physiological Health Risk (Single Model)",
    tags=["Predictions"],
    responses={
        400: {"model": ErrorResponse, "description": "Invalid model name or parameter"},
        422: {"model": ErrorResponse, "description": "Validation error on health features"},
    },
)
async def predict_health_risk(
    input_data: HealthDataInput,
    model: Optional[str] = Query(
        "xgboost",
        description="Model to use for inference ('logistic_regression', 'decision_tree', 'random_forest', 'xgboost')",
    ),
) -> PredictionResponse:
    """
    Run health risk prediction on a user biometric profile using the specified ML model.
    """
    model_service = ModelService.get_instance()
    prediction_service = PredictionService(model_service)

    try:
        return prediction_service.predict_single(input_data, model_name=model)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("Prediction failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed due to an internal processing error.",
        )


@app.post(
    "/predict/all",
    response_model=AllModelsPredictionResponse,
    summary="Predict Health Risk Across All Models",
    tags=["Predictions"],
    responses={
        422: {"model": ErrorResponse, "description": "Validation error on health features"},
    },
)
async def predict_health_risk_all_models(
    input_data: HealthDataInput,
) -> AllModelsPredictionResponse:
    """
    Run the same biometric profile through all four trained classification models.
    """
    model_service = ModelService.get_instance()
    prediction_service = PredictionService(model_service)

    try:
        return prediction_service.predict_all(input_data)
    except Exception as e:
        logger.error("Multi-model prediction failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Multi-model prediction failed due to an internal error.",
        )


@app.post(
    "/predict/custom",
    response_model=CustomPredictionResponse,
    summary="Custom Health Risk Prediction & Analysis",
    tags=["Predictions"],
    responses={
        400: {"model": ErrorResponse, "description": "Invalid model or input"},
        422: {"model": ErrorResponse, "description": "Validation error on health features"},
    },
)
async def predict_custom_input(
    input_data: HealthDataInput,
    model: Optional[str] = Query(
        "xgboost",
        description="Model to use for inference ('logistic_regression', 'decision_tree', 'random_forest', 'xgboost')",
    ),
) -> CustomPredictionResponse:
    """
    Test and analyze custom health input with detailed preprocessed feature values and health risk assessment.
    """
    model_service = ModelService.get_instance()
    prediction_service = PredictionService(model_service)

    try:
        return prediction_service.predict_custom(input_data, model_name=model)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("Custom prediction failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Custom prediction failed due to an internal error.",
        )


@app.post(
    "/explain",
    response_model=ExplanationResponse,
    summary="Explain Prediction Using SHAP (Local Feature Attribution)",
    tags=["Explainability"],
    responses={
        400: {"model": ErrorResponse, "description": "Invalid model name"},
        422: {"model": ErrorResponse, "description": "Validation error on health features"},
    },
)
async def explain_prediction(
    input_data: HealthDataInput,
    model: Optional[str] = Query(
        "xgboost",
        description="Model to explain ('logistic_regression', 'decision_tree', 'random_forest', 'xgboost')",
    ),
) -> ExplanationResponse:
    """
    Generate local feature contributions (SHAP values) for a specific health risk prediction.
    
    Returns structured JSON feature contributions ranked by absolute impact.
    Isolated from the main prediction endpoint for high performance.
    """
    model_service = ModelService.get_instance()
    prediction_service = PredictionService(model_service)

    try:
        return prediction_service.explain_prediction(input_data, model_name=model)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("SHAP explanation failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SHAP explanation generation failed due to an internal error.",
        )


# =====================================================================
# Frontend Static Files Mount (Vite build distribution)
# =====================================================================
if FRONTEND_DIST_DIR.exists():
    app.mount(
        "/",
        StaticFiles(directory=str(FRONTEND_DIST_DIR), html=True),
        name="frontend_static",
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
