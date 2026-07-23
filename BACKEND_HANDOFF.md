# Backend ↔ Frontend contract — TrackGuard

Cookie sessions via **same-origin proxy** (`NEXT_PUBLIC_API_URL=/backend/api` → `BACKEND_URL`).
This is required so mobile browsers keep auth cookies (cross-site Vercel→Render cookies get blocked).

**FE env**
- `NEXT_PUBLIC_API_URL=/backend/api`
- `BACKEND_URL=https://phone-tracker-be.onrender.com`
- `NEXT_PUBLIC_WS_URL=wss://…`
- `NEXT_PUBLIC_APP_URL` — public HTTPS FE (match backend `PUBLIC_APP_URL`)

Socket.IO uses `handshake.auth.token` from FE `/api/socket-token` (reads httpOnly cookie).

## Auth
| Method | Path |
|--------|------|
| POST | `/auth/login` |
| POST | `/auth/register` |
| POST | `/auth/verify-email` |
| POST | `/auth/resend-verification` |
| POST | `/auth/logout` |
| GET | `/auth/me` |
| POST | `/auth/refresh` |
| POST | `/auth/forgot-password` |
| POST | `/auth/reset-password` |

## Devices
| Method | Path |
|--------|------|
| GET | `/devices/user-devices` |
| POST | `/devices/register` |
| DELETE | `/devices/:deviceId` |
| POST | `/devices/generate-qr` |
| GET | `/devices/qr/:qrCodeId/status` |
| POST | `/devices/link-by-qr` `{ qrCodeId, location? }` |
| POST | `/devices/:deviceId/start-tracking` |
| GET | `/locations/history/:deviceId` |

**QR:** `https://{PUBLIC_APP_URL}/link-device/{qrCodeId}`  
FE route completes GPS + `link-by-qr`.
