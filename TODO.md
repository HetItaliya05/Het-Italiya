# TODO - MERN Production Refactor

## Step 1 — Client cleanup
- [x] Update `client/package.json` to remove backend dependencies.
- [x] Add `client/.env` and `client/.env.example`.
- [ ] Ensure all API calls use centralized `apiFetch/apiUrl` correctly.


## Step 2 — Server structure hardening
- [ ] Add `server/config/env.cjs` for env validation.
- [x] Create `server/.env` and `server/.env.example`.

- [ ] Add centralized error handling middleware.
- [ ] Ensure CORS config is correct for Render + Vercel and supports `credentials: true`.
- [ ] Ensure MongoDB connection is production-ready.

## Step 3 — Server startup robustness
- [ ] Refactor `server/server.cjs` to use config + middleware.
- [ ] Optimize `server/package.json` scripts for Render.

## Step 4 — Deployment-ready configuration
- [ ] Add/verify `.gitignore`.
- [ ] Add `.env.example` files for Render/Vercel.
- [ ] Add/verify root `vercel.json`.

## Step 5 — Verify builds & startup
- [ ] Run `npm run build` inside `client`.
- [ ] Run `npm start` inside `server` (with local env placeholders).
- [ ] Verify auth routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.

## Step 6 — Import/export & API URL consistency
- [ ] Fix any broken imports.
- [ ] Fix any remaining route mismatches.

## Done
- [ ] Update README with deployment steps (Vercel + Render). 

