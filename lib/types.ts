export interface PredictionResult {
  predictions: Prediction[];
}

export interface Prediction {
  label: string;
  confidence: number;
}

export interface ApiError {
  error: string;
}

export interface PawRecognitionResponse {
  predictions?: Prediction[];
  error?: string;
}

export type ImageSource = 'unsplash' | 'upload' | 'camera';

export interface UnsplashAttribution {
  photographer?: string;
  photographerUrl?: string;
  unsplashUrl?: string;
}

export interface RandomDogResponse {
  image: string;
  attribution?: UnsplashAttribution;
  error?: string;
}
