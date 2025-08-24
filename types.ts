
export interface Prediction {
  className: string;
  probability: number;
}

export interface Guidance {
  recyclingInstructions: string;
  environmentalImpact: string;
  reuseSuggestions: string[];
}

export interface ClassificationResult {
  id: string;
  imageSrc: string;
  prediction: Prediction;
  guidance: Guidance | null;
  timestamp: string;
}

export enum AppStatus {
  Idle,
  ModelLoading,
  Ready,
  Predicting,
  FetchingGuidance,
  Error,
}
