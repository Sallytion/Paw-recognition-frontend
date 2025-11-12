import { PawRecognitionResponse, RandomDogResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_URL || !API_KEY) {
  console.error('Missing API configuration. Check your .env.local file.');
}

/**
 * Convert File to Base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Image URL to Base64 string
 */
export async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Check if API is healthy
 */
export async function checkHealth(): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_URL}/`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}

/**
 * Predict paw breed from image
 */
export async function predictPaw(imageFile: File): Promise<PawRecognitionResponse> {
  try {
    // Validate file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Please upload a valid image file');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      throw new Error('Image size should be less than 5MB');
    }

    // Convert to base64
    const imageBase64 = await fileToBase64(imageFile);

    // Make API request
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY!,
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    // Handle rate limiting
    if (response.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please check your API key.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Prediction error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Predict from base64 string directly
 * Uses the Next.js API proxy to avoid CORS issues
 */
export async function predictFromBase64(imageBase64: string): Promise<PawRecognitionResponse> {
  try {
    // Use our Next.js API route as a proxy to avoid CORS
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Prediction error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Get random dog image from Unsplash
 */
export function getRandomDogImage(): string {
  // Using a random query parameter to get different images
  const timestamp = Date.now();
  return `https://source.unsplash.com/800x600/?dog&${timestamp}`;
}

/**
 * Fetch random dog image from the server proxy and return a data URL (base64)
 * This avoids client-side CORS issues when converting the image to base64.
 */
export async function getRandomDogImageBase64(): Promise<RandomDogResponse> {
  try {
    const res = await fetch('/api/random-dog');
    if (!res.ok) {
      throw new Error('Failed to fetch random image from server');
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data as RandomDogResponse;
  } catch (err) {
    console.error('getRandomDogImageBase64 error:', err);
    throw err;
  }
}
