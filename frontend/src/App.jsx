import React, { useState, useEffect, useCallback } from 'react';
import HeroSection from './components/HeroSection';
import HealthRiskResultsPage from './components/HealthRiskResultsPage';
import { INITIAL_FORM_DATA, FEATURE_BOUNDS } from './utils/constants';
import { 
  checkHealth, 
  predictHealthRisk, 
  predictAllModels, 
  predictCustom, 
  explainPrediction 
} from './services/api';

export default function App() {
  // Navigation / View State: 'form' | 'results'
  const [viewMode, setViewMode] = useState('form');

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [selectedModel, setSelectedModel] = useState('xgboost');
  const [isCompareAll, setIsCompareAll] = useState(false);
  const [includeExplainability, setIncludeExplainability] = useState(false);

  // Async Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Result States
  const [predictionResult, setPredictionResult] = useState(null);
  const [multiModelResult, setMultiModelResult] = useState(null);
  const [explanationResult, setExplanationResult] = useState(null);
  const [inputSnapshot, setInputSnapshot] = useState(null);

  // Connection & Backend Health State
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'healthy' | 'offline'

  // 1. Health Check
  const runHealthCheck = useCallback(async () => {
    setBackendStatus('checking');
    try {
      await checkHealth();
      setBackendStatus('healthy');
    } catch (err) {
      console.warn("FastAPI backend health check failed:", err);
      setBackendStatus('offline');
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  // 2. Field Change Handler
  const handleChangeField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // 3. Preset Scenario Selector
  const handleSelectPreset = (presetData) => {
    setFormData(presetData);
    setFormErrors({});
    setError(null);
  };

  // 4. Form Reset
  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setError(null);
    setPredictionResult(null);
    setMultiModelResult(null);
    setExplanationResult(null);
    setInputSnapshot(null);
    setViewMode('form');
  };

  // 5. Form Validation
  const validateForm = () => {
    const errors = {};
    Object.keys(FEATURE_BOUNDS).forEach((key) => {
      const val = formData[key];
      const meta = FEATURE_BOUNDS[key];
      if (val === '' || val === null || val === undefined || isNaN(val)) {
        errors[key] = `${meta.label} is required`;
      } else {
        const num = parseFloat(val);
        if (num < meta.min || num > meta.max) {
          errors[key] = `Must be between ${meta.min} and ${meta.max} ${meta.unit}`;
        }
      }
    });

    if (!formData.activity_level) {
      errors.activity_level = 'Activity level is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 6. Submit & Inference Orchestration
  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      const err = new Error("Please correct the highlighted physiological fields before submitting.");
      err.validationDetails = Object.values(formErrors);
      setError(err);
      return;
    }

    setIsLoading(true);
    setInputSnapshot({ ...formData });

    try {
      let singleRes = null;
      let allRes = null;

      if (isCompareAll) {
        // Multi-model prediction across all 4 algorithms
        allRes = await predictAllModels(formData);
        // Also run default single prediction for gauge display
        singleRes = await predictCustom(formData, selectedModel);
        setMultiModelResult(allRes);
        setPredictionResult(singleRes);
      } else {
        // Single model prediction with risk assessment & exact probabilities
        singleRes = await predictCustom(formData, selectedModel);
        setPredictionResult(singleRes);
        setMultiModelResult(null);
      }

      // If user enabled SHAP explainability, request local feature attribution
      if (includeExplainability) {
        try {
          const expRes = await explainPrediction(formData, selectedModel);
          setExplanationResult(expRes);
        } catch (expErr) {
          console.warn("SHAP explanation failed:", expErr);
        }
      } else {
        setExplanationResult(null);
      }

      setBackendStatus('healthy');
      // Transition user to dedicated Health Risk Results Page
      setViewMode('results');
    } catch (err) {
      console.error("Health Risk Prediction failed:", err);
      setError(err);
      if (err.isNetworkError) {
        setBackendStatus('offline');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef3f2] font-sans antialiased text-[#0b1f2a]">
      {viewMode === 'results' && predictionResult ? (
        <HealthRiskResultsPage
          predictionResult={predictionResult}
          multiModelResult={multiModelResult}
          explanationResult={explanationResult}
          inputSnapshot={inputSnapshot}
          selectedModel={selectedModel}
          onBackToForm={() => setViewMode('form')}
          onRecalculate={() => setViewMode('form')}
        />
      ) : (
        <HeroSection
          backendStatus={backendStatus}
          onRetryHealthCheck={runHealthCheck}
          activeModel={selectedModel}
          formData={formData}
          onChangeField={handleChangeField}
          onSelectPreset={handleSelectPreset}
          onReset={handleReset}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          isCompareAll={isCompareAll}
          onToggleCompareAll={() => setIsCompareAll(!isCompareAll)}
          includeExplainability={includeExplainability}
          onToggleExplainability={() => setIncludeExplainability(!includeExplainability)}
          formErrors={formErrors}
          predictionResult={predictionResult}
          multiModelResult={multiModelResult}
          explanationResult={explanationResult}
          inputSnapshot={inputSnapshot}
          error={error}
          onDismissError={() => setError(null)}
        />
      )}
    </div>
  );
}
