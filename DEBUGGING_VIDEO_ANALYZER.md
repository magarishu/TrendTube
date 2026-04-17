# Video Analyzer - Debugging Guide

## Issues Fixed in This Update

✅ **Root Cause Identified**: Server was crashing on MongoDB connection failure, preventing routes from being registered
✅ **Solution Implemented**: Server now starts even if MongoDB is unavailable
✅ **Enhanced Logging**: Added detailed startup logs to diagnose issues
✅ **Console Debugging**: Added comprehensive logging to frontend and backend

## Quick Start - Testing Video Analyzer

### 1. Start the Backend Server

Open a terminal in the `backend` folder and run:

```bash
npm start
```

or

```bash
node server.js
```

### Expected Output

You should see output like:

```
Environment Check:
YOUTUBE_API_KEY: SET
GEMINI_API_KEY: SET
MONGODB_URI: SET

[Startup] Attempting MongoDB connection...
✗ MongoDB Connection Failed: <error message>
  → Server will start without database functionality
[Startup] Importing route modules...
[Startup] Registering routes...
[Startup] ✓ All routes registered successfully

✓ Server started successfully
  📍 Backend: http://localhost:5000
  📍 Frontend: http://localhost:8080
  📊 Video Analyzer endpoint: http://localhost:5000/api/video/analyze
  🔍 Debug endpoint: http://localhost:5000/api/video/debug
```

**⚠️ If you see `process.exit(1)` or server crashes, check MongoDB connection in .env**

### 2. Start the Frontend Server

Open another terminal in the `frontend` folder and run:

```bash
npm run dev
```

### 3. Test the Video Analyzer

1. Navigate to `http://localhost:8080`
2. Click on "Video Analyzer" in the sidebar
3. Paste a YouTube video URL (example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
4. Click "Analyze Video"

### 4. Check Console Logs

#### Frontend Console (Browser DevTools - F12)
Look for logs starting with `[VideoAnalyzer]`:
- `[VideoAnalyzer] Sending request to: /api/video/analyze?url=...`
- `[VideoAnalyzer] Response status: 200`
- `[VideoAnalyzer] Analysis complete: {...}`

#### Backend Console
Look for logs starting with `[Video Analyzer]`:
- `[Video Analyzer] Request received with URL: ...`
- `[Video Analyzer] Extracted video ID: ...`
- `[Video Analyzer] Calling YouTube API...`
- `[Video Analyzer] Analysis complete`

## Diagnostic Endpoints

### Test Backend Connectivity

```bash
curl http://localhost:5000/api/startup-status
```

Expected response:
```json
{
  "status": "Backend is operational",
  "environment": {
    "nodeEnv": "development",
    "port": 5000,
    "youtubeApiKey": "configured",
    "geminiApiKey": "configured",
    "mongodbUri": "configured"
  },
  "endpoints": {
    "videoAnalyzer": "/api/video/analyze",
    "videoDebug": "/api/video/debug",
    "videoTest": "/api/video/test"
  }
}
```

### Test Video Analyzer Route

```bash
curl "http://localhost:5000/api/video/test"
```

Expected response:
```json
{
  "message": "Video analyzer route is working",
  "apiKeyStatus": {
    "youtube": "configured",
    "gemini": "configured"
  }
}
```

### Test with Actual Video URL

```bash
curl "http://localhost:5000/api/video/analyze?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

## Troubleshooting

### Problem: Still getting 404 errors

**Check #1: Backend is running on port 5000**
```bash
netstat -ano | findstr :5000     # Windows
lsof -i :5000                     # Mac/Linux
```

**Check #2: Vite proxy is configured**
- Open `frontend/vite.config.ts`
- Verify the proxy section exists:
```typescript
proxy: {
  "/api": {
    target: "http://localhost:5000",
    changeOrigin: true,
    rewrite: (path) => path
  }
}
```

**Check #3: Frontend is running on port 8080**
```bash
netstat -ano | findstr :8080     # Windows
lsof -i :8080                     # Mac/Linux
```

**Check #4: Check browser console**
- Press F12 in the browser
- Go to Console tab
- Look for any error messages or network errors
- The `[VideoAnalyzer]` logs will show you exactly where it's failing

### Problem: "YouTube API key not configured" error

1. Open `backend/.env`
2. Verify `YOUTUBE_API_KEY` is set to a valid Google API key
3. Restart the backend server

### Problem: "CORS error" in browser console

Check that the backend server is actually running and the CORS middleware is loaded. The error usually shows: `Access to XMLHttpRequest at 'http://localhost:5000/api/video/analyze' from origin 'http://localhost:8080' has been blocked by CORS policy`

**Solution:**
1. Verify backend is running: `curl http://localhost:5000/api/health`
2. Check the error handler middleware in server.js is properly configured
3. Restart both frontend and backend

### Problem: "Invalid response format (not JSON)"

The backend returned HTML instead of JSON. This usually means:
1. The route wasn't found (check `/api/startup-status`)
2. Express error handler triggered (check backend logs)

**Solution:**
1. Check backend logs for error messages
2. Verify the route is registered: `curl http://localhost:5000/api/video/test`

## Network Request Flow

```
Browser (http://localhost:8080)
    ↓
    [User pastes YouTube URL and clicks "Analyze"]
    ↓
Vite Dev Server (with proxy)
    ↓
    [Proxy forwards /api/video/analyze to http://localhost:5000]
    ↓
Express Backend (http://localhost:5000)
    ↓
    [Extracts video ID from URL]
    ↓
    [Calls YouTube Data API v3]
    ↓
    [Optionally calls Gemini API for AI analysis]
    ↓
    [Returns JSON response with analysis]
    ↓
Vite Dev Server
    ↓
Browser JavaScript
    ↓
    [Displays results in UI]
```

## Files Modified in This Update

1. **backend/utils/database.js**
   - Changed: Server no longer crashes if MongoDB unavailable
   - Impact: Routes still load even if database fails

2. **backend/server.js**
   - Added: `/api/startup-status` endpoint
   - Added: Detailed startup logging
   - Changed: loadRoutes() now handles MongoDB failures gracefully

3. **frontend/src/pages/VideoAnalyzer.tsx**
   - Added: Console logging for request/response debugging
   - Changed: More detailed error messages

## Environment Variables Required

For the Video Analyzer to work, you need:

```
YOUTUBE_API_KEY=your_api_key_here        # Required
GEMINI_API_KEY=your_api_key_here         # Optional (graceful fallback if missing)
MONGODB_URI=mongodb_connection_string    # Optional (not needed for Video Analyzer)
PORT=5000                                 # Backend port
FRONTEND_URL=http://localhost:8080       # Frontend URL for CORS
```

## Next Steps

1. **Start the servers** (both backend and frontend)
2. **Test with the diagnostics** above
3. **Check console logs** in both browser and terminal
4. **If still failing**, capture the full error message from the console logs and share

## Files to Monitor for Logs

- **Browser Console**: Frontend logs and network errors (F12 → Console)
- **Backend Terminal**: Backend logs and API call details
- Look for `[VideoAnalyzer]` tags in backend logs
- Look for `[VideoAnalyzer]` tags in browser console logs
