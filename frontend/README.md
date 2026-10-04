# SmartHealth - AI Stress Prediction Frontend

A modern, responsive, clinical-grade React web application for physiological stress prediction, multi-algorithm ML benchmarking, and Explainable AI (SHAP) feature attribution.

Built with **React 18**, **Vite**, **Tailwind CSS**, and **Lucide Icons**, communicating directly with your existing **FastAPI** machine learning backend.

---

## 🚀 Quick Start Guide

### 1. Start the FastAPI Backend

Make sure your Python environment is active and run the backend from the project root:

```bash
# From project root
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/health`

---

### 2. Start the React Frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at:
👉 **`http://localhost:5173`**

---

## ⚙️ Configuration (`.env`)

The frontend uses Vite environment variables. The API URL is never hardcoded:

```env
# frontend/.env
VITE_API_URL=http://127.0.0.1:8000
```

If your backend is deployed to a remote server or different port, simply update `VITE_API_URL` and restart the Vite dev server.

---

## 🧩 Architecture & Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx                 # Top bar with live FastAPI health status pill
│   │   ├── PredictionForm.jsx         # 6-feature input form with model switcher & validation
│   │   ├── PredictionResult.jsx       # Clinical outcome card with probabilities & interpretation
│   │   ├── MultiModelComparison.jsx   # Side-by-side comparison across all 4 ML models
│   │   ├── ExplainabilityCard.jsx     # SHAP local feature attribution & impact bars
│   │   ├── InputField.jsx             # Dual range slider + numerical inputs with normal range hints
│   │   ├── PresetSelector.jsx         # 1-click test profiles (Relaxed, High Stress, Athletic, etc.)
│   │   ├── LoadingSpinner.jsx         # Animated AI analysis feedback
│   │   └── ErrorMessage.jsx           # User-friendly errors, CORS hints, and server diagnostics
│   │
│   ├── services/
│   │   └── api.js                     # Decoupled REST API service with error normalization
│   │
│   ├── utils/
│   │   └── constants.js               # Physiological bounds, presets, and model metadata
│   │
│   ├── App.jsx                        # Main application layout and state management
│   ├── index.css                      # Tailwind base & glassmorphism theme styling
│   └── main.jsx                       # Application entry point
│
├── .env                               # Configurable API URL
├── .env.example                       # Example environment file
├── index.html                         # HTML template with Inter font & medical branding
├── package.json                       # Dependencies and build scripts
├── postcss.config.js                  # PostCSS plugins
├── tailwind.config.js                 # Tailwind CSS theme configuration
└── vite.config.js                     # Vite bundler configuration
```

---

## 🔬 Features & Capabilities

- **Real-Time Stress Classification:** Predicts stress levels using physiological signals (Heart Rate, SpO2, Step Count, Sleep Duration, Activity Level, Perceived/Sensor Stress Score).
- **Multi-Model Inference:** Supports **XGBoost**, **Random Forest**, **Decision Tree**, and **Logistic Regression**.
- **Multi-Model Matrix (`/predict/all`):** Run predictions through all 4 algorithms simultaneously with ensemble consensus percentage.
- **Explainable AI (`/explain`):** Local SHAP values visualizer showing which features increased or decreased stress risk.
- **1-Click Clinical Presets:** Test immediate realistic scenarios (*Relaxed & Rested*, *High Stress & Sleep Deprived*, *Athletic Recovery*, *Workday Fatigue*).
- **Responsive & Accessible Design:** Fully optimized for desktop, tablet, and mobile with keyboard accessibility and biological range validation.
- **Robust Error Handling:** Detects network offline states, CORS issues, HTTP 400/422/500 errors, and provides actionable troubleshooting steps.

---

## 🔒 CORS Configuration

Your FastAPI backend (`backend/main.py`) already includes CORS middleware for `http://localhost:5173` and `http://127.0.0.1:5173`.

If you ever change frontend ports or host domains, ensure your FastAPI backend allows your origin:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
