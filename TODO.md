# TODO - Wallet MongoDB Source of Truth

## Step 1: Backend wallet routes (wallet.cjs)
- [ ] Ensure all wallet endpoints validate JWT and amount (no NaN/negative/zero)
- [ ] Ensure wallet document auto-creates with balance=0 for missing users (upsert)
- [ ] Ensure consistent JSON response structure for success/failure
- [ ] Add production-safe error logging for production debugging

## Step 2: Backend admin/deposit integration (deposit.cjs + scan)
- [ ] Update approved deposit logic to adjust MongoDB Wallet balance only
- [ ] Ensure no direct User.walletBalance mutations remain
- [ ] Ensure amount validation + atomic updates where applicable
- [ ] (If needed) update withdrawal admin flows to adjust Wallet balance correctly

## Step 3: Frontend refactor (AppContext + wallet component)
- [ ] Remove local wallet balance persistence (no localStorage wallet balance)
- [ ] Remove all local balance mutations (game win, check-in, gift code, placeBet)
- [ ] Fetch wallet balance immediately after login and after refresh
- [ ] Re-fetch balance after every add/withdraw transaction
- [ ] Add spinner UX while fetching balance

## Step 4: Environment safety (VITE_API_URL)
- [ ] Ensure all wallet API calls use VITE_API_URL via apiFetch/apiUrl
- [ ] Ensure Render CORS allows deployed Vercel origin

## Step 5: Project-wide cleanup
- [ ] Scan entire project for remaining references:
  - [ ] `user.walletBalance`
  - [ ] local wallet balance state/mutations
  - [ ] mock/demo wallet balance
  - [ ] hardcoded balance state
- [ ] Replace with backend-driven Wallet logic

## Step 6: Testing + deployment notes
- [ ] Run server/client build or dev tests
- [ ] Verify refresh does not reset balance to 0
- [ ] Verify insufficient balance withdraw is blocked
- [ ] Provide deployment checklist for Render (backend) + Vercel (frontend)

