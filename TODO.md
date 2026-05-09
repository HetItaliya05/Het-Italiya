# TODO

## Step 1: Reproduce and identify the failing URL/path on Vercel
- Capture the exact path returning 404 (e.g. `/api/auth/me`, `/admin/overview`, `/uploads/...`).

## Step 2: Fix Vercel rewrite configuration ✅
- Updated `vercel.json` to exclude `/api/*`, `/admin/*`, and `/uploads/*` from the SPA fallback rewrite to `/index.html`.
- Note: if the backend is still not deployed as Vercel handlers, `/api/*` may still 404, but it won’t be incorrectly rewritten to the SPA.


## Step 3: Ensure MongoDB env var alignment (Render/other hosts) ✅
- In `server/server.cjs`, change Mongo connection to use `process.env.MONGO_URI`.
- Ensure your host sets `MONGO_URI` (not `MONGODB_URI`).


## Step 4: Decide architecture
- Option A: Host backend separately and change frontend `API_BASE` from `http://localhost:5000/api` to your backend URL.
- Option B: Convert backend to Vercel functions / proper server-side deployment so `/api/*` and `/admin/*` are routed.

## Step 5: Testing
- Test locally: verify `/api/health` responds.
- Test locally with auth endpoints if possible.
- After deployment: verify `/api/health` and one protected endpoint.

