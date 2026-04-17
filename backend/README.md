# TrendTube Backend

Node.js/Express backend server for TrendTube application.

## Project Structure

```
backend/
├── server.js              # Main server entry point
├── package.json           # Dependencies
├── .env                   # Environment variables
├── routes/                # API routes
│   ├── videos.js
│   ├── creators.js
│   ├── categories.js
│   └── analytics.js
├── controllers/           # Request handlers
│   └── videoController.js
├── middleware/            # Custom middleware
│   └── auth.js
└── utils/                 # Utility functions
    └── database.js
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
PORT=5000
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get video by ID
- `POST /api/videos/:id/analyze` - Analyze video
- `GET /api/videos/search?query=...` - Search videos

### Creators
- `GET /api/creators` - Get all creators
- `GET /api/creators/:id` - Get creator by ID
- `GET /api/creators/:id/analytics` - Get creator analytics
- `GET /api/creators/search?query=...` - Search creators

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/videos` - Get videos by category

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/video/:id` - Get video analytics
- `GET /api/analytics/creator/:id` - Get creator analytics
- `GET /api/analytics/trends` - Get current trends

## Health Check
- `GET /api/health` - Backend health status

## Frontend Connection

The backend is configured to accept requests from the frontend at `http://localhost:8080` (configurable via `.env`).

## Next Steps

1. Set up a database (MongoDB, PostgreSQL, etc.)
2. Implement database models
3. Connect database to controllers
4. Add authentication/authorization
5. Implement business logic for each endpoint
6. Add input validation
7. Add error handling
8. Add unit tests
