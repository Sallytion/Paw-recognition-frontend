# 🚀 Quick Reference - Paw Recognition API

## API Endpoint
```
Base URL: https://paw-recognition-c6208b7f2ea2.herokuapp.com
```

## Authentication
```
Header: X-API-Key
Value: 3omOG2IlyO1LYO8PLXNoXXYv7zsx-CtK3rVau1DvcMM
```

## Endpoints

### Health Check
```bash
GET /
Response: { "message": "Server is up and running!" }
```

### Predict Paw Breed
```bash
POST /predict
Headers:
  Content-Type: application/json
  X-API-Key: 3omOG2IlyO1LYO8PLXNoXXYv7zsx-CtK3rVau1DvcMM
Body:
  {
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  }
Response:
  {
    "predictions": [
      {
        "label": "golden-retriever",
        "confidence": 0.95
      },
      {
        "label": "labrador",
        "confidence": 0.03
      }
    ]
  }
```

## Rate Limits
- 100 requests per hour per IP address

## File Requirements
- Format: JPG, PNG, GIF, WebP
- Max Size: 5MB
- Must be base64 encoded with data URI prefix

## Quick Test (curl)
```bash
curl -X POST https://paw-recognition-c6208b7f2ea2.herokuapp.com/predict \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 3omOG2IlyO1LYO8PLXNoXXYv7zsx-CtK3rVau1DvcMM" \
  -d '{"image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

## Quick Test (JavaScript)
```javascript
const response = await fetch('https://paw-recognition-c6208b7f2ea2.herokuapp.com/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': '3omOG2IlyO1LYO8PLXNoXXYv7zsx-CtK3rVau1DvcMM'
  },
  body: JSON.stringify({ image: 'data:image/jpeg;base64,...' })
});

const data = await response.json();
console.log(data.predictions);
```

## Error Codes
- 400: Bad Request (invalid image)
- 401: Unauthorized (missing API key)
- 403: Forbidden (invalid API key)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

## CORS
Frontend domains must be whitelisted. Contact backend admin to add your domain.

## Support
Check FRONTEND_INTEGRATION_GUIDE.md for detailed documentation.
