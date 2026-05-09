# Deployment Fix Plan (Render + Vercel + MongoDB Atlas)

- [ ] Inspect remaining backend files for env usage and route mounting.
- [x] Fix MongoDB connection (`server/server.cjs`) to use `process.env.MONGODB_URI`, add options + retry + no hard crash.

- [ ] Remove hardcoded JWT secret fallbacks in backend (`server/server.cjs`, `server/middleware/auth.cjs`, `server/routes/auth.cjs`, `server/routes/admin.cjs`).
- [ ] Improve production-safe CORS handling in backend.
- [ ] Fix Vercel frontend API base to use `import.meta.env.VITE_API_URL` (`src/context/AppContext.tsx`).
- [ ] Add backend start scripts to root `package.json` for Render.
- [ ] Add `.env.example` files (backend + frontend) and ensure variables are consistent.
- [ ] Test locally: backend connect health + login/me.
- [ ] Final deployment instructions (Render env + start cmd, Vercel env, Atlas whitelist guidance).

