# Phase 1: Auth & Login — QUILA STUDIOS DATA CENTER

**Status:** Not started
**Repository:** `git@github.com:anom768/quila_studios_datacenter.git`
**Branch for this phase:** `feature/phase-1-auth-login`
**Depends on:** Phase 0 (Project Foundation) must be merged first

## Goal

Implement authentication: login, session persistence via an HttpOnly cookie, a
protected "who am I" endpoint, and an admin-only endpoint to create new user
accounts. No other business module (Staff, Academy, etc.) is touched in this
phase — only the `User` model already created in Phase 0 is used.

---

## 0. Design Decisions (already made — do not re-discuss, just implement)

- **Account creation:** No public self-registration. New accounts are created
  only by an existing admin, through a protected `POST /api/auth/register`
  endpoint. The very first admin account is created by a one-time seed script
  (section 5), since an admin must already exist to create others.
- **Session storage:** The JWT is stored in an **HttpOnly cookie**, not
  returned in the JSON response body and not stored in browser
  `localStorage`. This prevents the token from being readable or stealable by
  JavaScript (XSS protection) — a stronger default than the more common
  "return token in body, store in localStorage" pattern.
- **Session length:** JWT expires after **7 days** (`JWT_EXPIRES_IN=7d`),
  matching the "long session, convenient for a small internal tool" choice
  already made for this project.

---

## 1. New/Changed Backend Files

```
backend/
├── prisma/
│   └── seed.js                          # NEW — creates the first admin user
├── src/
│   ├── routes/
│   │   └── auth.routes.js                # NEW
│   ├── controllers/
│   │   └── auth.controller.js             # NEW (first real file in this folder)
│   ├── application/
│   │   └── auth.application.js             # NEW (first real file in this folder)
│   ├── services/
│   │   ├── userService.js                   # NEW (first real file in this folder)
│   │   └── tokenService.js                   # NEW
│   ├── validations/
│   │   └── auth.validation.js                 # NEW
│   ├── middleware/
│   │   ├── authGuard.js                        # NEW — verifies the session cookie
│   │   └── roleGuard.js                         # NEW — restricts a route to given roles
│   ├── errors/
│   │   └── ForbiddenError.js                    # NEW — 403, distinct from UnauthorizedError (401)
│   ├── utils/
│   │   └── password.js                          # NEW — bcrypt hash/compare helpers
│   └── app.js                                    # MODIFIED — see section 4
```

Delete the `.gitkeep` placeholder in `controllers/`, `application/`, and
`services/` once each folder has its first real file.

---

## 2. Database

No schema changes needed — the `User` model from Phase 0 already has
`username`, `passwordHash`, and `role`. Do not modify `schema.prisma` in this
phase.

---

## 3. Endpoints

All responses use the standard format from Phase 0
(`{ success, data }` / `{ success: false, error }`).

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Verify credentials, set session cookie |
| POST | `/api/auth/logout` | Public | Clear the session cookie |
| GET | `/api/auth/me` | Authenticated (any role) | Return the current user's `id`, `username`, `role` |
| POST | `/api/auth/register` | Authenticated + role `admin` | Create a new user account |

### 3.1 `POST /api/auth/login`
- Validate body with Joi: `username` (required, string), `password` (required, string)
- `application/auth.application.js` → `loginUseCase(username, password)`:
  1. Find user by username via `userService.findByUsername`
  2. If not found → throw `UnauthorizedError('Invalid username or password')`
     (do not reveal whether it was the username or password that was wrong)
  3. Compare password with `passwordHash` via `utils/password.js`'s `comparePassword`
  4. If it doesn't match → same `UnauthorizedError` as above
  5. Sign a JWT via `tokenService.signToken({ sub: user.id, username: user.username, role: user.role })`
- Controller sets the cookie:
  ```js
  res.cookie('quila_token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_EXPIRES_IN
  });
  ```
- Response data: `{ id, username, role }` (never include `passwordHash` or the raw token in the body)

### 3.2 `POST /api/auth/logout`
- Clears the cookie: `res.clearCookie('quila_token')`
- Response data: `{ message: 'Logged out' }`

### 3.3 `GET /api/auth/me`
- Protected by `authGuard`
- Returns `req.user` (the decoded token payload: `id`, `username`, `role`) —
  re-fetch the user from the database if you want fresher data (e.g. in case
  role changed since the token was issued); for this phase, returning the
  token payload directly is sufficient

### 3.4 `POST /api/auth/register`
- Protected by `authGuard` AND `roleGuard('admin')`
- Validate body with Joi: `username` (required, string, min 3), `password`
  (required, string, min 8), `role` (required, one of `'admin'`, `'staff'`)
- `application/auth.application.js` → `registerUseCase(data)`:
  1. Check username doesn't already exist (`userService.findByUsername`) →
     if it does, throw `ValidationError('Username already taken')`
  2. Hash the password via `utils/password.js`'s `hashPassword`
  3. Create the user via `userService.createUser`
- Response data: created user's `{ id, username, role }` (never the hash)

---

## 4. Middleware

### 4.1 `authGuard.js`
- Reads the JWT from `req.cookies.quila_token`
- If missing → throw `UnauthorizedError('Not authenticated')`
- Verify with `tokenService.verifyToken` — if invalid/expired → throw the same
  `UnauthorizedError`
- On success, attach the decoded payload to `req.user` and call `next()`

### 4.2 `roleGuard.js`
- A middleware factory: `roleGuard(...allowedRoles)`
- Must run AFTER `authGuard` (relies on `req.user` already being set)
- If `req.user.role` is not in `allowedRoles` → throw
  `ForbiddenError('Insufficient permissions')`

### 4.3 Changes to `app.js`
- Add `cookie-parser` middleware (new dependency) so `req.cookies` works:
  `app.use(cookieParser())`
- Change `cors()` from wide-open to a specific origin with credentials, since
  cookies require this:
  ```js
  app.use(cors({
    origin: config.frontendUrl, // from env, e.g. http://localhost:3000
    credentials: true,
  }));
  ```
- Mount the new router: `app.use('/api/auth', authRoutes)`

---

## 5. Seed Script (Bootstrap Admin)

`backend/prisma/seed.js`:
- Reads `ADMIN_SEED_USERNAME` and `ADMIN_SEED_PASSWORD` from env
- Hashes the password with the same `utils/password.js` helper
- Uses Prisma to `upsert` (not plain `create`) a user with that username and
  role `admin` — `upsert` so running the seed twice doesn't crash on a
  duplicate username
- Log a clear success message to console when done

Add to `backend/package.json`:
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```
Run with: `npx prisma db seed`

---

## 6. New Environment Variables

Add to `backend/.env.example`:
```
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ADMIN_SEED_USERNAME=admin
ADMIN_SEED_PASSWORD=
```
Add to `backend/.env.test.example`:
```
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
ADMIN_SEED_USERNAME=admin
ADMIN_SEED_PASSWORD=
```
(Real values for `ADMIN_SEED_PASSWORD` go only in the real `.env` files, never
committed — same rule as Phase 0.)

New backend dependency to install: `cookie-parser`

---

## 7. Frontend Changes

### 7.1 `src/lib/api.js` (MODIFIED)
- Add `credentials: 'include'` to the default fetch config, so the browser
  sends the session cookie with every request to the backend

### 7.2 `src/app/login/page.js` (NEW)
- A simple form: `username`, `password`, submit button
- On submit, calls `fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })`
- On success, redirect to `/dashboard`
- On failure, show the error message returned by the API

### 7.3 `src/app/dashboard/page.js` (NEW — placeholder)
- On mount, calls `fetchAPI('/api/auth/me')`
- If it fails (401), redirect to `/login`
- If it succeeds, display the logged-in user's `username` and `role`, plus a
  "Logout" button that calls `POST /api/auth/logout` then redirects to `/login`
- This page is just a placeholder to prove auth works end-to-end — it is NOT
  the real dashboard (that comes with the business modules in later phases)

---

## 8. Git Workflow for This Phase

1. Branch from `main` (after Phase 0 is merged): `feature/phase-1-auth-login`
2. Commit in small labeled steps (e.g. `add auth validations and errors`,
   `add auth services and application layer`, `add auth routes and
   controller`, `add authGuard and roleGuard middleware`, `add seed script`,
   `add frontend login and dashboard pages`)
3. Open a Pull Request into `main` titled `Phase 1: Auth & Login`, linked to
   the corresponding GitHub Issue
4. Include in the PR description: a screenshot of a successful login →
   dashboard flow, and a screenshot of `/api/auth/me` failing with 401 when
   not logged in (e.g. via an incognito window or a tool like Postman without
   the cookie)

---

## 9. Definition of Done

- [ ] `controllers/`, `services/`, `application/` folders now contain real
      files; their `.gitkeep` placeholders are removed
- [ ] `POST /api/auth/login` succeeds with correct credentials and sets the
      `quila_token` HttpOnly cookie
- [ ] `POST /api/auth/login` fails with a clear error (via the standard error
      format) on wrong username or wrong password, without revealing which
- [ ] `GET /api/auth/me` returns the current user when the cookie is present,
      and fails with 401 when it isn't
- [ ] `POST /api/auth/register` succeeds only when called by a logged-in
      `admin`, and fails with 403 for a logged-in `staff` user, and 401 for no
      session at all
- [ ] `POST /api/auth/logout` clears the cookie and `/api/auth/me` fails
      afterward
- [ ] Seed script creates the bootstrap admin user and is safe to re-run
- [ ] `.env.example` and `.env.test.example` updated in `backend/` with the
      new variables
- [ ] Frontend `/login` and `/dashboard` pages work end-to-end against the
      real backend
- [ ] `npm run lint` passes in `backend/` with no errors
- [ ] Pull Request opened to `main`, linked to its GitHub Issue, with the
      screenshots described in section 8

---

## Notes for the Junior Programmer

- Do not build any Staff/Academy/Archive/etc. business logic in this phase —
  only auth
- Do not return the JWT itself in any JSON response body — it must only ever
  live in the HttpOnly cookie
- Follow the same layer responsibilities from Phase 0 strictly: controllers
  never call Prisma directly, services never touch `req`/`res`
- All naming (folders, files, variables, functions, commit messages) must be
  in English
