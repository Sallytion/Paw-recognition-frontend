# 🐾 Paw Recognition - Dog Breed Predictor

An AI-powered Next.js application that identifies dog breeds from images using machine learning.

## ✨ Features

- **3 Image Input Methods:**
  - 📸 **Camera**: Take a photo directly from your device camera
  - 📁 **File Upload**: Upload dog images from your device (JPG, PNG, max 5MB)
  - 🎲 **Random Dog Image**: Get random dog images from Unsplash

- **AI-Powered Predictions**: Real-time breed identification with confidence scores
- **Beautiful UI**: Modern, responsive design with dark mode support
- **Fast & Reliable**: Built with Next.js 14 and TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository or navigate to the project folder:
```bash
cd paw-frontend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env.local` file is already created with the API credentials.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
paw-frontend/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application page
├── lib/
│   ├── api.ts               # API client functions
│   └── types.ts             # TypeScript type definitions
├── .env.local               # Environment variables (API keys)
├── .env.example             # Example environment file
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Project dependencies
```

## 🎯 How to Use

1. **Choose an Image Source:**
   - Click "Random Dog Image" to get a sample dog photo
   - Click "Upload Image" to select a photo from your device
   - Click "Take Photo" to use your camera

2. **Identify Breed:**
   - Click the "🔍 Identify Breed" button
   - Wait for the AI to analyze the image

3. **View Results:**
   - See breed predictions with confidence percentages
   - Try another image by clicking "Try Another Image"

## 🔧 Environment Variables

The app requires these environment variables (already set in `.env.local`):

```env
NEXT_PUBLIC_API_URL=https://paw-recognition-c6208b7f2ea2.herokuapp.com
NEXT_PUBLIC_API_KEY=3omOG2IlyO1LYO8PLXNoXXYv7zsx-CtK3rVau1DvcMM
```

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📦 Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

## 🌐 API Integration

This app integrates with the Paw Recognition API:
- **Base URL**: `https://paw-recognition-c6208b7f2ea2.herokuapp.com`
- **Authentication**: API Key via `X-API-Key` header
- **Rate Limit**: 100 requests per hour

For more details, see `API_QUICK_REFERENCE.md` and `FRONTEND_INTEGRATION_GUIDE.md`.

## 🎨 Features Breakdown

### Image Sources

#### 1. Random Unsplash Images
- Fetches random dog images from Unsplash
- No upload required - instant testing
- Different image each time

#### 2. File Upload
- Supports JPG, PNG, GIF, WebP
- Max file size: 5MB
- Drag & drop support
- Preview before prediction

#### 3. Camera Capture
- Access device camera
- Real-time preview
- Capture and analyze instantly
- Works on mobile and desktop

### Predictions Display
- Top predictions with confidence scores
- Visual progress bars
- Formatted breed names
- Percentage display

## 🔒 Security

- API key is client-side visible (normal for public APIs)
- No sensitive data stored
- CORS-enabled backend
- Rate limiting protection

## 📱 Responsive Design

- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface
- Optimized for tablets and desktops

## 🐛 Troubleshooting

**Camera not working?**
- Ensure browser has camera permissions
- Use HTTPS (required for camera access)
- Try a different browser

**Prediction fails?**
- Check image file size (max 5MB)
- Ensure image contains a dog
- Verify internet connection

**Random image not loading?**
- Check internet connection
- Try again (Unsplash may be rate limiting)

## 📄 License

This project is for demonstration purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ using Next.js and AI**
