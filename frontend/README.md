# Mock Interview Frontend

This is the Next.js React frontend for the Mock Interview Platform.

## Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running on `http://localhost:3001` (for development)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Frontend environment variables are already configured in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production, update this to your production API URL.

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   ├── api/                          # (Removed - Now in backend)
│   ├── admin/                        # Admin pages
│   ├── dashboard/                    # User dashboard
│   ├── interviewer-dashboard/        # Interviewer pages
│   ├── interview/                    # Interview pages
│   ├── login/                        # Login page
│   ├── register/                     # Registration page
│   ├── profile/                      # User profile
│   └── components/                   # Reusable components
│
├── lib/
│   ├── api.ts                        # API client configuration
│   └── [other utilities]
│
└── globals.css                       # Global styles
```

## Key Pages

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - User/Candidate dashboard
- `/interviewer-dashboard` - Interviewer dashboard
  - `/interviewer-dashboard/schedule` - Schedule interview
  - `/interviewer-dashboard/interviews` - View interviews
  - `/interviewer-dashboard/analytics` - Analytics
- `/admin` - Admin panel
- `/profile` - User profile

## API Integration

All API calls go through the backend at `NEXT_PUBLIC_API_URL`.

Example API call:
```typescript
// Frontend makes request
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Backend handles request at localhost:3001/api/user/profile
```

## Authentication

- JWT tokens stored in localStorage
- User session managed via `useAuth` hook
- Protected pages redirect to login if not authenticated

## Styling

- **Tailwind CSS** for utility-first styling
- **Material-UI (MUI)** for component library
- Custom CSS in `globals.css`

## Components

Reusable UI components located in `src/app/components/`

## Pages Included

### Public Pages
- Home page
- Login page
- Registration page
- Terms of Service
- Privacy Policy
- Cookie Policy

### Protected Pages (Require Auth)
- User Dashboard
- Interviewer Dashboard
- Admin Panel
- User Profile

### Interviewer Features
- Schedule interviews
- View scheduled interviews
- Analytics & reports
- Candidate management

### Admin Features
- User management
- Analytics
- Interview guide management
- Skills management

## Development

- Hot reload enabled via Next.js
- TypeScript for type safety
- Use Material-UI components for consistency
- Follow existing code patterns

## Building for Production

1. Update `.env.local` with production API URL
2. Run `npm run build` to create optimized production build
3. Deploy to Vercel (recommended) or your hosting platform

## Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- Netlify
- AWS Amplify
- Digital Ocean
- Heroku

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

This is the only required environment variable. It must be accessible from the browser.

## Troubleshooting

### API Not Connecting
- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS is enabled on backend
- Check browser console for error messages

### Build Errors
- Delete `.next` folder and `node_modules`, then run `npm install` again
- Check for TypeScript errors: `npx tsc --noEmit`

## Contributing

- Follow existing code patterns
- Keep components small and reusable
- Test pages in different screen sizes
- Update this README if adding new pages

## License

ISC
