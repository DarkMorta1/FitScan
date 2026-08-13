# FITSCAN Backend

Node.js Express API for the FITSCAN nutrition and fitness platform.

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `AI_SERVICE_URL` | FastAPI service URL (default: http://localhost:8000) |
| `CLIENT_URL` | Frontend URL for CORS |

## Default Admin

- Email: `admin@fitscan.com`
- Password: `Admin@123456`

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Forgot password |
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update KYC profile |
| GET | `/api/foods` | Search foods |
| POST | `/api/scans/upload` | Upload food image |
| POST | `/api/scans/analyze` | Analyze food by ID |
| GET | `/api/dashboard` | Dashboard data |
| GET | `/api/recommendations/meals` | Meal recommendations |
| GET | `/api/recommendations/workouts` | Workout plans |
| GET | `/api/admin/stats` | Admin statistics |

## Architecture

```
Frontend → Node Backend → FastAPI AI (localhost:8000/predict)
```

The backend maps user profile + food nutrition to the exact FastAPI schema before calling the AI service.
