# Backend ↔ Frontend contract — TrackGuard

## Auth cookies

FE calls **`/backend/api/*`** (Next route proxy → `BACKEND_URL`) for cookie-authenticated desktop calls.

Login/refresh may also return `accessToken` / `refreshToken` (Bearer) when cookies are blocked.

**FE env (Vercel + local)**
```
NEXT_PUBLIC_API_URL=/backend/api
BACKEND_URL=https://phone-tracker-be.onrender.com
NEXT_PUBLIC_WS_URL=wss://phone-tracker-be.onrender.com
NEXT_PUBLIC_APP_URL=https://phone-tracker-fe.vercel.app
```

Socket.IO uses `handshake.auth.token` from `/api/socket-token`.

## QR link flow (no phone login)

1. Desktop (cookie auth): `POST /devices/generate-qr` → `{ qrCodeId, linkUrl, expiresIn, qrCodeImage }`
2. QR encodes  
   `https://{PUBLIC_APP_URL}/link-device/{qrCodeId}?claim={claimToken}&api={API_URL}`
3. Phone opens FE (**no login**):
   - `GET /devices/qr/:id/info?claim=` — public preview
   - `POST /devices/qr/claim` `{ qrCodeId, claimToken, location? }` — links to generator’s account
4. Desktop polls `GET /devices/qr/:id/status` (cookie) until `linked`

Use `?api=` from the QR so the phone hits the **same** backend that minted the QR (host allowlisted on FE).

**Important:** If you generate the QR on local BE, Vercel → production API will not find it. Generate against production (or redeploy BE), then scan a fresh QR.
