# Assessment Platform — Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` — the default already points at
   `http://localhost:4000/api`, so if your backend is running locally on
   port 4000, you don't need to change anything.

3. Run the dev server:
```bash
npm run dev
```
Opens at `http://localhost:5173`

## What's built so far

- **Login page** (`/login`) — shared entry point for Admin, Manager, and
  Employee. Calls `POST /api/auth/login` on your backend, stores the JWT,
  and redirects based on the returned role:
  - `ADMIN` → `/admin`
  - `MANAGER` → `/manager`
  - `EMPLOYEE` → `/employee`
- **Auth context** (`src/context/AuthContext.tsx`) — holds the logged-in
  user and exposes `login()` / `logout()` to the whole app. Token persists
  in `localStorage` so refreshing the page doesn't log you out.
- **Protected routes** — each role's dashboard route checks that the
  logged-in user actually has that role before rendering; otherwise it
  redirects to `/login`.
- **Placeholder dashboards** — each role currently lands on a simple
  "Welcome, {name}" screen with a sign-out button, confirming the auth +
  routing loop works. These get replaced with the real dashboards next.

## Try it

With your backend running (`npm run dev` in `assessment-backend`), start
this frontend and log in with your seeded admin:
```
admin@org.com / Admin@123
```
You should land on `/admin` and see the placeholder welcome screen.

## Next steps
- Build out the real Employee dashboard: pick platform/level → take
  AI-generated quiz → see results
- Build out the Admin dashboard: manage users, generate quizzes, view
  org-wide reports
- Build out the Manager dashboard: view team, track scores
