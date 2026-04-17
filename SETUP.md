# TrendTube - Full Stack Setup Guide

This project is divided into two main parts: **Frontend** and **Backend**

## Project Structure

```
trendtube-2/
├── frontend/          # React + Vite + TypeScript frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env           # Frontend environment variables
│
└── backend/           # Node.js + Express backend
    ├── routes/
    ├── controllers/
    ├── middleware/
    ├── server.js
    ├── package.json
    └── .env           # Backend environment variables
```

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Git

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your `.env` file in the backend folder (already created with defaults).

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Configure your `.env` file in the frontend folder (already created with defaults).

## Running Both Applications

### Option 1: Run in separate terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:8080`

### Option 2: Run from root (if you set up concurrently)

You can optionally set up a root `package.json` with concurrently to run both:

```bash
npm install concurrently
npm start  # Will run both frontend and backend
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

## API Integration

The frontend has a built-in API client at `src/services/apiClient.ts` that automatically connects to the backend.

### Example usage in frontend components:

```typescript
import apiClient from '@/services/apiClient';

// Get all videos
const videos = await apiClient.videos.getAll();

// Get creators
const creators = await apiClient.creators.getAll();

// Get analytics
const analytics = await apiClient.analytics.getDashboard();
```

## API Endpoints

All endpoints are prefixed with `/api`:

- **Videos**: `/videos`, `/videos/:id`, `/videos/:id/analyze`, `/videos/search`
- **Creators**: `/creators`, `/creators/:id`, `/creators/:id/analytics`, `/creators/search`
- **Categories**: `/categories`, `/categories/:id`, `/categories/:id/videos`
- **Analytics**: `/analytics/dashboard`, `/analytics/video/:id`, `/analytics/creator/:id`, `/analytics/trends`

## Development Workflow

1. **Frontend Changes**: Edit files in `frontend/src/` and changes will hot-reload
2. **Backend Changes**: Edit files in `backend/` and use `npm run dev` for auto-reload via nodemon
3. **New API Endpoints**: Add routes in `backend/routes/` and corresponding API calls in `frontend/src/services/apiClient.ts`

## Next Steps

1. **Database Setup**: Add your preferred database (MongoDB, PostgreSQL, etc.)
2. **Authentication**: Implement JWT or session-based authentication
3. **Data Models**: Create proper data models in backend controllers
4. **Frontend Components**: Connect frontend components to API endpoints
5. **Testing**: Add unit and integration tests
6. **Deployment**: Set up CI/CD pipelines

## Troubleshooting

- **Backend not connecting**: Make sure both servers are running and ports are correct
- **CORS errors**: Check that `FRONTEND_URL` in backend `.env` matches your frontend URL
- **API calls failing**: Check browser console and backend terminal for error messages
- **Port already in use**: Change the port in `.env` file

## Support

For more information, check individual README files:
- `frontend/README.md` - Frontend documentation
- `backend/README.md` - Backend documentation
