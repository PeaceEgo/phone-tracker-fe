# TrackGuard (phone-tracker-fe)

Next.js frontend for a device location tracker: cookie auth, device registration, location history, and Socket.IO live maps.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Zustand · Zod · react-hook-form
- Socket.IO client · Leaflet
- Tailwind CSS · shadcn/ui

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Same-origin API base — use `/backend/api` (proxied) |
| `NEXT_PUBLIC_WS_URL` | Socket.IO origin (e.g. `wss://host`) |
| `NEXT_PUBLIC_APP_URL` | Public HTTPS FE origin for QR links (match backend `PUBLIC_APP_URL`) |
| `BACKEND_URL` | Upstream API origin for Next rewrites (server-only) |

The backend must allow credentials (cookies) from your frontend origin.

## Scripts

```bash
npm run dev    # turbopack dev server
npm run build  # production build
npm run start  # serve production build
npm run lint   # ESLint
```

## Features (what this app actually does)

- Email/password auth with verify-email OTP
- Register and manage tracked devices
- Location history
- Real-time map tracking over WebSockets

## Backend handoff

See [`BACKEND_HANDOFF.md`](./BACKEND_HANDOFF.md) for the API contract, what FE already uses, and what backend should prioritize (password reset, QR status, socket payload confirmation).
