'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { predictPaw, predictFromBase64, getRandomDogImageBase64, urlToBase64 } from '@/lib/api';
import { PawRecognitionResponse, ImageSource, UnsplashAttribution } from '@/lib/types';
import Image from 'next/image';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<PawRecognitionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource | null>(null);
  const [unsplashAttribution, setUnsplashAttribution] = useState<UnsplashAttribution | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Effect to handle video stream attachment
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        setError('Failed to start video playback');
      });
    }
  }, [cameraActive, stream]);

  const resetState = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setImageSource(null);
    setUnsplashAttribution(null);
    if (cameraActive) {
      stopCamera();
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setImageSource('upload');
      setError(null);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Unsplash random image (via server proxy to avoid CORS/redirect issues)
  const handleUnsplashImage = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch a base64 data URL from our server-side proxy
      const response = await getRandomDogImageBase64();
      setSelectedImage(response.image);
      setImageSource('unsplash');
      if (response.attribution) {
        setUnsplashAttribution(response.attribution);
      }
    } catch (err) {
      console.error('Unsplash fetch error:', err);
      setError('Failed to load random dog image');
    } finally {
      setLoading(false);
    }
  };

  // Handle camera access
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Try 'user' instead of 'environment' for testing
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera stream obtained:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      setCameraActive(true);
      setError(null);
      setResult(null);
      setSelectedImage(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track);
        track.stop();
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        setImageSource('camera');
        stopCamera();
      }
    }
  };

  // Handle prediction
  const handlePredict = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response: PawRecognitionResponse;

      // All images are already in base64 format (data URL)
      // - Unsplash: converted by our API route
      // - Upload: converted by FileReader
      // - Camera: converted by canvas.toDataURL
      response = await predictFromBase64(selectedImage);

      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">
            🐾 Paw Recognition
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered dog breed identification
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
          {/* Image Source Options */}
          {!selectedImage && !cameraActive && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Choose Image Source
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Unsplash Option */}
                <button
                  onClick={handleUnsplashImage}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Random Dog Image
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    From Unsplash
                  </span>
                </button>

                {/* File Upload Option */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <Upload className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Image
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG (Max 5MB)
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Camera Option */}
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <Camera className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Take Photo
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use Camera
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Camera View */}
          {cameraActive && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black w-full" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  📸 Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden">
                {imageSource === 'unsplash' ? (
                  <img
                    src={selectedImage}
                    alt="Selected dog"
                    className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-700"
                  />
                ) : (
                  <img
                    src={selectedImage}
                    alt="Selected dog"
                    className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-700"
                  />
                )}
                <button
                  onClick={resetState}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                  aria-label="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Unsplash Attribution */}
              {unsplashAttribution && unsplashAttribution.photographer && (
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Photo by{' '}
                  <a
                    href={unsplashAttribution.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {unsplashAttribution.photographer}
                  </a>
                  {' '}on{' '}
                  <a
                    href={unsplashAttribution.unsplashUrl || 'https://unsplash.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Unsplash
                  </a>
                </div>
              )}

              {/* Predict Button */}
              {!result && (
                <button
                  onClick={handlePredict}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    '🔍 Identify Breed'
                  )}
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-xl">
              <p className="font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Results */}
          {result && result.predictions && (
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Prediction Results
              </h3>
              <div className="space-y-3">
                {result.predictions.map((prediction, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 border border-indigo-200 dark:border-gray-500"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
                        {prediction.label.replace(/-/g, ' ')}
                      </span>
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-500 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={resetState}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                Try Another Image
              </button>
            </div>
          )}
        </div>

        {/* Hidden canvas for camera capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400 text-sm">
          <p>Powered by AI • Built with Next.js</p>
        </div>
      </div>
    </main>
  );
}
