# TODO - Frontend/Backend connection fixes

- [x] Update `client/src/context/AppContext.tsx` to always compute correct API base and avoid wrong `/auth/...` calls when env is missing.
- [x] Update `server/server.cjs` CORS policy to reliably work in development and production (and support credentials correctly).
- [x] Update `client/vite.config.ts` with dev-time proxy so frontend can call relative `/api/...` without needing `VITE_API_URL`.
- [ ] Run frontend & backend in dev mode and verify auth session call (`/api/auth/me`).


