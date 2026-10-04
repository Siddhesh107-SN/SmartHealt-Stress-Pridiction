/**
 * Constants and metadata for SmartHealth AI Health Risk Prediction
 */

export const AVAILABLE_MODELS = [
  {
    id: "xgboost",
    name: "XGBoost Classifier",
    tag: "High Accuracy (99.5%)",
    description: "Gradient boosted decision trees optimized for biometric tabular health risk classification.",
    isDefault: true,
  },
  {
    id: "random_forest",
    name: "Random Forest",
    tag: "Ensemble",
    description: "Ensemble of bagging decision trees with high generalization capacity.",
  },
  {
    id: "decision_tree",
    name: "Decision Tree",
    tag: "Interpretable",
    description: "Hierarchical rule-based decision tree with transparent decision paths.",
  },
  {
    id: "logistic_regression",
    name: "Logistic Regression",
    tag: "Linear Baseline",
    description: "Standard statistical linear classification model for reference.",
  },
];

export const ACTIVITY_LEVELS = [
  {
    value: "sedentary",
    label: "Sedentary",
    subtext: "Desk work / minimal physical activity (< 3,000 steps)",
    badge: "Low Exertion",
  },
  {
    value: "active",
    label: "Active",
    subtext: "Moderate daily walking / routine exercise (5,000 - 10,000 steps)",
    badge: "Moderate Exertion",
  },
  {
    value: "highly active",
    label: "Highly Active",
    subtext: "Intense daily workouts / athletic training (> 10,000 steps)",
    badge: "High Exertion",
  },
];

export const INITIAL_FORM_DATA = {
  heart_rate_bpm: 75,
  blood_oxygen_level: 98,
  step_count: 6500,
  sleep_duration_hours: 7.5,
  activity_level: "active",
  stress_level: 3.5,
};

export const PRESET_SCENARIOS = [
  {
    id: "optimal_health",
    name: "Optimal Health & Rested",
    description: "Optimal biometric vitals, adequate sleep (8h), and active recovery.",
    icon: "ShieldCheck",
    color: "emerald",
    expectedTier: "low",
    data: {
      heart_rate_bpm: 68,
      blood_oxygen_level: 99,
      step_count: 8500,
      sleep_duration_hours: 8.0,
      activity_level: "active",
      stress_level: 2.0,
    },
  },
  {
    id: "acute_strain",
    name: "Elevated Health Strain & Fatigue",
    description: "Tachycardic heart rate, poor sleep (<5h), and elevated biomarker strain.",
    icon: "Flame",
    color: "rose",
    expectedTier: "critical",
    data: {
      heart_rate_bpm: 108,
      blood_oxygen_level: 94,
      step_count: 2200,
      sleep_duration_hours: 4.5,
      activity_level: "sedentary",
      stress_level: 8.5,
    },
  },
  {
    id: "athletic_recovery",
    name: "Athletic High Recovery",
    description: "High daily step count, high SpO2 oxygenation, and restorative sleep.",
    icon: "Activity",
    color: "teal",
    expectedTier: "low",
    data: {
      heart_rate_bpm: 58,
      blood_oxygen_level: 99,
      step_count: 14200,
      sleep_duration_hours: 8.5,
      activity_level: "highly active",
      stress_level: 1.5,
    },
  },
  {
    id: "workday_fatigue",
    name: "Workday Strain / Moderate",
    description: "Desk-bound lifestyle, mild fatigue, and borderline vitals.",
    icon: "AlertTriangle",
    color: "amber",
    expectedTier: "moderate",
    data: {
      heart_rate_bpm: 86,
      blood_oxygen_level: 96,
      step_count: 4100,
      sleep_duration_hours: 6.0,
      activity_level: "sedentary",
      stress_level: 5.5,
    },
  },
];

export const FEATURE_BOUNDS = {
  heart_rate_bpm: {
    min: 30,
    max: 250,
    step: 1,
    unit: "BPM",
    label: "Heart Rate",
    description: "Resting or current heart rate in beats per minute (Normal: 60-100 BPM)",
    normalRange: [60, 100],
  },
  blood_oxygen_level: {
    min: 50,
    max: 100,
    step: 1,
    unit: "% SpO2",
    label: "Blood Oxygen Level",
    description: "Blood oxygen saturation percentage (Normal: 95-100%)",
    normalRange: [95, 100],
  },
  step_count: {
    min: 0,
    max: 50000,
    step: 100,
    unit: "Steps",
    label: "Daily Step Count",
    description: "Total steps recorded today by wearable tracker (Target: 7,000-10,000)",
    normalRange: [6000, 15000],
  },
  sleep_duration_hours: {
    min: 0,
    max: 24,
    step: 0.5,
    unit: "Hours",
    label: "Sleep Duration",
    description: "Total hours of restful sleep in last 24-hour cycle (Target: 7-9 hours)",
    normalRange: [7, 9],
  },
  stress_level: {
    min: 0,
    max: 10,
    step: 0.1,
    unit: "/ 10",
    label: "Sensor / Perceived Stress Score",
    description: "Galvanic skin response or subjective stress score (0 = None, 10 = Severe) as a contributing factor",
    normalRange: [0, 4],
  },
};
