/**
 * API Service for SmartHealth AI Health Risk Prediction Backend
 * 
 * Handles all REST API communications with FastAPI.
 * Base URL is configurable via environment variable VITE_API_URL.
 */

import { getRiskTier } from '../utils/riskConfig';

// Base URL configuration (defaults to relative paths for unified FastAPI deployment)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/**
 * Transforms frontend form state into the format expected by the FastAPI backend.
 * Compatible with both snake_case and alias formats accepted by the Pydantic schema.
 */
export function formatPayload(formData) {
  return {
    heart_rate_bpm: parseFloat(formData.heart_rate_bpm),
    blood_oxygen_level: parseFloat(formData.blood_oxygen_level),
    step_count: parseFloat(formData.step_count),
    sleep_duration_hours: parseFloat(formData.sleep_duration_hours),
    activity_level: formData.activity_level,
    stress_level: parseFloat(formData.stress_level),
  };
}

/**
 * Normalizes different API response shapes into a unified frontend structure for Health Risk Assessment.
 */
export function normalizePredictionResponse(data, fallbackModel = "xgboost") {
  const isHighRisk = 
    data.prediction === 1 || 
    data.prediction === "1" || 
    (typeof data.label === "string" && (data.label.toLowerCase().includes("high") || data.label.toLowerCase().includes("elevated") || data.label.toLowerCase().includes("risk"))) ||
    (typeof data.class_name === "string" && (data.class_name.toLowerCase().includes("high") || data.class_name.toLowerCase().includes("risk")));

  // Determine probability
  let probability = 0.5;
  if (typeof data.probability === "number") {
    probability = data.probability;
  } else if (typeof data.confidence === "number") {
    probability = data.confidence > 1 ? data.confidence / 100 : data.confidence;
  } else if (typeof data.confidence_percentage === "number") {
    probability = data.confidence_percentage / 100;
  }

  // Calculate health risk score (0 - 100)
  const healthRiskScore = isHighRisk 
    ? +(probability * 100).toFixed(1) 
    : +(Math.max(5, (1 - probability) * 100)).toFixed(1);

  const tier = getRiskTier(healthRiskScore);

  const label = data.label || data.class_name || (isHighRisk ? "Elevated Health Risk" : "Low Health Risk");
  const prediction = typeof data.prediction === "number" ? data.prediction : (isHighRisk ? 1 : 0);

  // Determine class-by-class probabilities
  let probabilities = data.probabilities || null;
  if (!probabilities && typeof probability === "number") {
    if (isHighRisk) {
      probabilities = {
        "Low Health Risk": Math.max(0, +(1 - probability).toFixed(4)),
        "Elevated Health Risk": +(probability).toFixed(4),
      };
    } else {
      probabilities = {
        "Low Health Risk": +(probability).toFixed(4),
        "Elevated Health Risk": Math.max(0, +(1 - probability).toFixed(4)),
      };
    }
  }

  return {
    success: true,
    model: data.model || fallbackModel,
    prediction,
    label,
    isHighStress: isHighRisk, // kept for backward compatibility
    isHighRisk,
    healthRiskScore,
    riskTier: tier,
    probability,
    confidencePct: +(probability * 100).toFixed(1),
    probabilities,
    riskAssessment: data.risk_assessment || null,
    preprocessedFeatures: data.preprocessed_features || null,
    raw: data,
  };
}

/**
 * Universal error parser to convert fetch/HTTP errors into clear, actionable messages.
 */
async function handleResponse(response) {
  if (response.ok) {
    return await response.json();
  }

  let errorBody = null;
  try {
    errorBody = await response.json();
  } catch {
    // Non-JSON response body
  }

  let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
  let validationDetails = null;

  if (errorBody) {
    if (response.status === 422 && errorBody.detail) {
      errorMessage = errorBody.error || "Input validation failed. Please check the entered values.";
      if (Array.isArray(errorBody.detail)) {
        validationDetails = errorBody.detail.map((err) => {
          if (typeof err === "object" && err.field && err.message) {
            return `${err.field}: ${err.message}`;
          }
          if (typeof err === "object" && err.loc && err.msg) {
            const field = err.loc.filter(l => l !== "body").join(".");
            return `${field || "Field"}: ${err.msg}`;
          }
          return typeof err === "string" ? err : JSON.stringify(err);
        });
      }
    } else if (errorBody.error) {
      errorMessage = errorBody.error;
      validationDetails = errorBody.detail;
    } else if (errorBody.detail) {
      errorMessage = typeof errorBody.detail === "string" ? errorBody.detail : JSON.stringify(errorBody.detail);
    }
  }

  const error = new Error(errorMessage);
  error.status = response.status;
  error.validationDetails = validationDetails;
  error.isHttpError = true;
  throw error;
}

/**
 * Wrap standard fetch with network & CORS diagnostic error detection.
 */
async function fetchWithDiagnostics(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.isHttpError) {
      throw err;
    }

    // Network / CORS / Server offline failure
    const isOffline = !navigator.onLine;
    const error = new Error(
      isOffline 
        ? "You appear to be offline. Please check your internet connection."
        : `Could not connect to FastAPI server at ${API_BASE_URL}. Ensure the backend is running with 'uvicorn backend.main:app --reload'.`
    );
    error.isNetworkError = true;
    error.possibleCors = true;
    error.originalError = err;
    throw error;
  }
}

/**
 * 1. Health check endpoint: GET /health
 */
export async function checkHealth() {
  return await fetchWithDiagnostics(`${API_BASE_URL}/health`, { method: "GET" });
}

/**
 * 2. Get list of available models: GET /models
 */
export async function getModels() {
  return await fetchWithDiagnostics(`${API_BASE_URL}/models`, { method: "GET" });
}

/**
 * 3. Single model health risk prediction: POST /predict?model={modelName}
 */
export async function predictHealthRisk(formData, modelName = "xgboost") {
  const payload = formatPayload(formData);
  const data = await fetchWithDiagnostics(
    `${API_BASE_URL}/predict?model=${encodeURIComponent(modelName)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return normalizePredictionResponse(data, modelName);
}

// Alias for existing callers
export const predictStress = predictHealthRisk;

/**
 * 4. Multi-model comparison: POST /predict/all
 */
export async function predictAllModels(formData) {
  const payload = formatPayload(formData);
  const data = await fetchWithDiagnostics(`${API_BASE_URL}/predict/all`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

/**
 * 5. Custom prediction with full feature extraction: POST /predict/custom?model={modelName}
 */
export async function predictCustom(formData, modelName = "xgboost") {
  const payload = formatPayload(formData);
  const data = await fetchWithDiagnostics(
    `${API_BASE_URL}/predict/custom?model=${encodeURIComponent(modelName)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return normalizePredictionResponse(data, modelName);
}

/**
 * 6. Explain prediction with SHAP local feature attribution: POST /explain?model={modelName}
 */
export async function explainPrediction(formData, modelName = "xgboost") {
  const payload = formatPayload(formData);
  const data = await fetchWithDiagnostics(
    `${API_BASE_URL}/explain?model=${encodeURIComponent(modelName)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return data;
}
