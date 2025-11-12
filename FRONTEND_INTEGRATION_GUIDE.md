# Paw Recognition Frontend - Next.js Integration Guide

## 📋 Overview

This guide will help you integrate the Paw Recognition AI backend into your Next.js application. The backend uses API key authentication to ensure secure access.

---

## 🔐 Backend API Details

**Base URL:** `https://paw-recognition-c6208b7f2ea2.herokuapp.com`

**Authentication:** API Key (Header-based)

**Endpoints:**
- `GET /` - Health check
- `POST /predict` - Image prediction (requires authentication)

---

## 🚀 Quick Start

### 1. Create Environment Variables

Create a `.env.local` file in your Next.js project root:

```env
# Paw Recognition API Configuration
NEXT_PUBLIC_API_URL=https://paw-recognition-c6208b7f2ea2.herokuapp.com
NEXT_PUBLIC_API_KEY=3omOG2IlyO1LYO8PLXNoXXYv7zsx-CtK3rVau1DvcMM
```

**Important Notes:**
- ✅ Use `NEXT_PUBLIC_` prefix for client-side accessible variables
- ✅ Add `.env.local` to `.gitignore` (Next.js does this by default)
- ❌ Never commit API keys to version control
- ⚠️ The API key will be visible in browser (this is normal for public APIs)

---

## 📦 Installation

No additional packages required! Next.js comes with `fetch` built-in.

Optional packages for enhanced UX:

```bash
npm install react-dropzone          # For drag-and-drop file upload
npm install @radix-ui/react-toast   # For notifications
npm install lucide-react            # For icons
```

---

## 🏗️ Project Structure

```
your-nextjs-app/
├── app/
│   ├── api/                    # Optional: Server-side API routes
│   ├── paw-recognition/
│   │   ├── page.tsx           # Main recognition page
│   │   └── loading.tsx        # Loading state
│   └── layout.tsx
├── components/
│   ├── PawRecognitionForm.tsx # Upload form component
│   ├── ResultDisplay.tsx      # Results display component
│   └── ImagePreview.tsx       # Image preview component
├── lib/
│   ├── api.ts                 # API client functions
│   └── types.ts               # TypeScript types
├── .env.local                 # Environment variables (DON'T COMMIT)
└── .env.example               # Example env file (commit this)
```

---

## 📝 TypeScript Types

Create `lib/types.ts`:

```typescript
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
```

---

## 🔌 API Client

Create `lib/api.ts`:

```typescript
import { PawRecognitionResponse } from './types';

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
 */
export async function predictFromBase64(imageBase64: string): Promise<PawRecognitionResponse> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY!,
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
```

---

## 🎨 React Components

### Main Page Component

Create `app/paw-recognition/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { predictPaw } from '@/lib/api';
import { PawRecognitionResponse } from '@/lib/types';

export default function PawRecognitionPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PawRecognitionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setResult(null);
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await predictPaw(selectedImage);
      
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

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          🐾 Paw Recognition AI
        </h1>

        {/* Upload Section */}
        <div className="mb-6">
          <label className="block">
            <span className="text-gray-700 font-medium mb-2 block">
              Select a paw image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
                cursor-pointer"
            />
          </label>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="mb-6 relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handlePredict}
            disabled={!selectedImage || loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
              text-white font-semibold rounded-lg
              hover:from-purple-700 hover:to-blue-700
              disabled:from-gray-300 disabled:to-gray-400
              disabled:cursor-not-allowed
              transition-all duration-200
              shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" 
                    stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Analyze Paw'
            )}
          </button>

          {selectedImage && (
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg
                hover:bg-gray-700 transition-all duration-200"
            >
              Reset
            </button>
          )}
        </div>

        {/* Result */}
        {result && result.predictions && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 
            border border-green-200 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Prediction Results
            </h2>
            <div className="space-y-3">
              {result.predictions.map((prediction, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg capitalize">
                      {prediction.label.replace(/-/g, ' ')}
                    </span>
                    <span className="text-purple-600 font-bold">
                      {(prediction.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

---

## 🎯 Alternative: Server-Side Prediction

For better security (hide API key from client), create a Next.js API route:

Create `app/api/predict/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY!,
      },
      body: JSON.stringify({ image }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.error || 'Prediction failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Then update your client to call `/api/predict` instead of the backend directly:

```typescript
// In lib/api.ts
export async function predictPaw(imageFile: File): Promise<PawRecognitionResponse> {
  try {
    const imageBase64 = await fileToBase64(imageFile);

    // Call your Next.js API route instead
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Prediction failed');
    }

    return await response.json();
  } catch (error) {
    // ... error handling
  }
}
```

---

## 🎨 Enhanced Component with Drag & Drop

Install react-dropzone:

```bash
npm install react-dropzone
```

Create `components/PawDropzone.tsx`:

```typescript
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PawDropzoneProps {
  onImageSelect: (file: File) => void;
}

export default function PawDropzone({ onImageSelect }: PawDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-3 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200
        ${
          isDragActive
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="text-6xl">🐾</div>
        {isDragActive ? (
          <p className="text-purple-600 font-semibold">Drop the paw image here...</p>
        ) : (
          <>
            <p className="text-gray-700 font-semibold">
              Drag & drop a paw image here
            </p>
            <p className="text-gray-500 text-sm">
              or click to select from your device
            </p>
            <p className="text-gray-400 text-xs">
              Supports: JPG, PNG, GIF, WebP (Max 5MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing

Create a simple test page to verify API connection:

Create `app/test-api/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { checkHealth } from '@/lib/api';

export default function TestAPIPage() {
  const [status, setStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await checkHealth();
      setStatus(`✅ Connected! ${response.message}`);
    } catch (error) {
      setStatus(`❌ Failed to connect: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
        <p className="text-gray-600 mb-4">Status: {status}</p>
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        <div className="mt-4 text-sm text-gray-500">
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
          <p>API Key: {process.env.NEXT_PUBLIC_API_KEY ? '✓ Set' : '✗ Missing'}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use environment variables for API configuration
- Add `.env.local` to `.gitignore`
- Validate file types and sizes on the client
- Handle errors gracefully
- Show loading states during API calls
- Consider rate limiting on your frontend
- Use server-side API routes for sensitive operations

### ❌ DON'T:
- Hardcode API keys in your code
- Commit `.env.local` to version control
- Skip client-side validation
- Expose raw error messages to users
- Allow unlimited file uploads

---

## 📱 Mobile Responsive Example

Add this to your Tailwind config for better mobile support:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
    },
  },
};
```

Update your page component with mobile-friendly styles:

```typescript
<main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 
  py-6 md:py-12 px-4">
  <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl 
    p-4 md:p-8">
    {/* ... your content ... */}
  </div>
</main>
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set environment variables in your hosting platform (Vercel, Netlify, etc.)
- [ ] Test API connection from deployed frontend
- [ ] Verify CORS settings allow your frontend domain
- [ ] Test on mobile devices
- [ ] Add error tracking (Sentry, LogRocket, etc.)
- [ ] Add analytics if needed
- [ ] Test file upload limits
- [ ] Verify loading states work correctly

### Vercel Deployment

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: `https://paw-recognition-c6208b7f2ea2.herokuapp.com`
   - `NEXT_PUBLIC_API_KEY`: `3omOG2IlyO1LYO8PLXNoXXYv7zsx-CtK3rVau1DvcMM`
4. Deploy!

---

## 🐛 Troubleshooting

### API Key Not Working
- Check if environment variables are set correctly
- Restart Next.js dev server after changing `.env.local`
- Verify you're using `NEXT_PUBLIC_` prefix

### CORS Errors
- Contact backend admin to add your domain to `ALLOWED_ORIGINS`
- For development, ensure `localhost:3000` is allowed

### Rate Limit Errors
- Implement request throttling on frontend
- Cache results when possible
- Show clear error message to users

### Image Upload Fails
- Check file size (max 5MB)
- Verify file type (images only)
- Ensure base64 conversion is working

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Dropzone](https://react-dropzone.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 💡 Example Use Cases

1. **Dog Breed Identification App**
2. **Pet Adoption Platform** - Help identify breeds
3. **Veterinary Assistant** - Quick breed recognition
4. **Educational Tool** - Learn about different dog breeds
5. **Pet Social Network** - Auto-tag breeds in photos

---

## 📞 Support

If you encounter any issues:

1. Check this documentation first
2. Verify environment variables are set correctly
3. Test API connection using the test page
4. Check browser console for errors
5. Contact backend team if API is down

---

## 🎉 You're Ready!

You now have everything you need to integrate the Paw Recognition API into your Next.js application. Happy coding! 🚀

---

**Last Updated:** November 12, 2025  
**API Version:** 1.0  
**Backend URL:** https://paw-recognition-c6208b7f2ea2.herokuapp.com
