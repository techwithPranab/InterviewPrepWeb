# Mock Interview Backend API

This is the Node.js + Express backend API server for the Mock Interview Platform.

## Prerequisites

- Node.js 16+ 
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/mock-interview
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:3000
```

## Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/:id` - Get user by ID

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill (admin only)
- `PUT /api/skills/:id` - Update skill (admin only)
- `DELETE /api/skills/:id` - Delete skill (admin only)

### Scheduled Interviews
- `GET /api/interviewer/scheduled-interviews` - Get scheduled interviews
- `POST /api/schedule/interview` - Schedule new interview
- `PUT /api/schedule/interview/:id` - Update scheduled interview
- `DELETE /api/schedule/interview/:id` - Cancel interview

### Interview Guides
- `GET /api/interview-guides` - Get all interview guides
- `GET /api/interview-guides/:id` - Get specific guide
- `POST /api/interview-guides` - Create guide (admin only)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics
- `PUT /api/admin/users/:id` - Update user role

### Analytics
- `GET /api/interviewer/analytics` - Get interviewer analytics
- `GET /api/interviewer/stats` - Get interviewer statistics

## Project Structure

```
src/
├── config/
│   ├── database.ts         # MongoDB connection
│   └── env.ts             # Environment validation
├── middleware/
│   ├── auth.ts            # JWT authentication
│   ├── errorHandler.ts    # Error handling
│   └── validation.ts      # Input validation
├── models/
│   ├── User.ts
│   ├── ScheduledInterview.ts
│   ├── Skill.ts
│   ├── InterviewGuide.ts
│   └── Assessment.ts
├── routes/
│   ├── auth.ts
│   ├── user.ts
│   ├── skills.ts
│   ├── interviews.ts
│   ├── admin.ts
│   └── analytics.ts
├── services/
│   ├── emailService.ts    # Email sending
│   ├── aiService.ts       # OpenAI integration
│   └── fileService.ts     # File upload handling
├── utils/
│   ├── validators.ts
│   └── helpers.ts
└── server.ts              # Express app entry point
```

## Database Schema

### User Model
- `_id`, `firstName`, `lastName`, `email`, `password`, `role` (user/interviewer/admin)
- `profile` (experience, skills, bio)
- `timestamps`

### ScheduledInterview Model
- `_id`, `userId`, `interviewerId`, `title`, `description`
- `candidateName`, `candidateEmail`, `skills`, `duration`
- `scheduledAt`, `status` (scheduled/confirmed/completed/cancelled)
- `resumeUrl`, `registrationLink`, `meetingLink`
- `timestamps`

### Skill Model
- `_id`, `name`, `category`, `description`
- `timestamps`

### InterviewGuide Model
- `_id`, `title`, `skillName`, `questions` (array)
- `difficulty`, `type`, `timestamps`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Tokens are issued on login and can be refreshed using the refresh endpoint.

## Error Handling

API returns standardized error responses:
```json
{
  "message": "Error description",
  "status": 400,
  "errors": ["Additional error details"]
}
```

## Development

- Make changes to files in `src/`
- TypeScript files are automatically compiled
- Use `npm run dev` for development with auto-reload
- Use `npm run lint` to check code quality

## Deployment

For production deployment:
1. Build the project: `npm run build`
2. Set environment variables on hosting platform
3. Run: `npm start`

### Environment Variables for Production
- Update `MONGODB_URI` to your MongoDB Atlas URI
- Set strong `JWT_SECRET`
- Update `FRONTEND_URL` to your production frontend URL
- Configure email service credentials
- Add `OPENAI_API_KEY` for AI features

## Testing

(To be added) - API testing with Jest/Supertest

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Document API endpoints
4. Test new features

## License

ISC
