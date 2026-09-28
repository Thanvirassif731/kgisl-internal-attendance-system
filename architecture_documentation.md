# Architecture Overview – Internal Attendance System (KITE)

---

## 1. High‑Level Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Vite + React (TypeScript) | UI, routing, state, API calls |
| **Styling** | Vanilla CSS (with optional Tailwind utilities) | Modern look, dark‑mode, micro‑animations |
| **Backend** | Node.js + Express (TypeScript) | REST API, authentication, business logic |
| **ORM / DB** | Prisma (v5) + SQLite (`dev.db`) | Data modeling, migrations, type‑safe queries |
| **Auth** | JSON Web Tokens (jwt) + bcrypt | Password hashing, stateless token auth |
| **Configuration** | dotenv (`.env`) + `src/config/env.ts` | Centralised runtime config (port, DB URL, JWT secret, etc.) |

---

## 2. Data Model (Prisma)
```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  username      String   @unique
  passwordHash  String   // bcrypt hash
  role          Role     @default(USER) // ADMIN or USER
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  // … other relations (attendance, leaves, etc.)
}

enum Role {
  ADMIN
  USER
}
```

- **Where credentials are stored** – The `User` table lives in the SQLite file `backend/dev.db`.  Passwords never appear in plain text; they are stored as a bcrypt hash (`passwordHash`).
- The **JWT secret** (`JWT_SECRET`) and **expiry** (`JWT_EXPIRES_IN`) are defined in `.env` and loaded via `src/config/env.ts`.

---

## 3. User Creation Flow
1. **Client side** – A registration page collects `email`, `username`, and `password`.
2. **API call** – `POST /api/auth/register` sends the payload to `AuthController.register`.
3. **Backend processing**:
   - The password is hashed with `bcrypt.hash(password, config.bcryptSaltRounds)`.
   - A new `User` record is created with the hashed password.
   - The DB write is performed via the Prisma client (`prisma.user.create`).
4. **Response** – The endpoint returns a **201 Created** with a short success message (no token is issued yet).

> **Result:** The user’s credentials are now persisted securely in SQLite; the raw password never touches the database.

---

## 4. Login & JWT Generation
1. **Client** posts `email|username` + `password` to `POST /api/auth/login`.
2. **AuthController.login**
   - Finds the user by *email* **or** *username* (flexible lookup).
   - Uses `bcrypt.compare` to verify the supplied password against `user.passwordHash`.
   - On success, calls the utility `generateJwt(user.id, user.role)`.
3. **JWT Utility (`src/utils/jwt.utils.ts`)**
   ```ts
   export const generateJwt = (userId: number, role: Role) => {
     return jwt.sign({ sub: userId, role }, config.jwtSecret, {
       expiresIn: config.jwtExpiresIn,
     });
   };
   ```
   - Payload contains `sub` (user id) and `role`.
   - Signed with the secret from `.env`.
   - Expiration is read from `config.jwtExpiresIn` (default `1d`).
4. **Response** – The server returns `{ token: <JWT> }`.
5. **Frontend handling** – The `login` function in `frontend/src/services/api.ts` stores the token in `localStorage` and updates the global `AuthContext` state.

---

## 5. JWT Validation (Protected Routes)
1. **Middleware (`src/middleware/auth.middleware.ts`)**
   ```ts
   export const authenticate = (req, res, next) => {
     const header = req.headers.authorization?.split(' ')[1];
     if (!header) return res.status(401).json({ message: 'Missing token' });

     try {
       const payload = jwt.verify(header, config.jwtSecret) as JwtPayload;
       req.user = { id: payload.sub, role: payload.role };
       next();
     } catch (err) {
       return res.status(401).json({ message: 'Invalid or expired token' });
     }
   };
   ```
2. The middleware is attached to any route that needs authentication (e.g., `router.use('/attendance', authenticate, attendanceRouter)`).
3. After verification, `req.user` is available for controllers to enforce role‑based access (e.g., only `ADMIN` can manage other users).

---

## 6. Front‑End Token Usage
- **Axios interceptor (`frontend/src/services/api.ts`)** adds `Authorization: Bearer <token>` to every outgoing request after a user logs in.
- The token is read from `localStorage.getItem('token')`.
- When a 401 response is received, the interceptor can optionally clear the token and redirect to the login page (not shown but easy to add).

---

## 7. Configuration & Secrets
- **`.env`** (root of `backend/`)
  ```dotenv
  PORT=5000
  DATABASE_URL=file:./dev.db
  JWT_SECRET=super_secret_key_here
  JWT_EXPIRES_IN=1d
  BCRYPT_SALT_ROUNDS=10
  ```
- These values are loaded via `dotenv` in `src/config/env.ts` and exported as the `config` object used across the codebase.
- **Important** – Do **not** commit `.env` to source control; it is listed in `.gitignore`.

---

## 8. Summary of Flow
```mermaid
flowchart TD
    subgraph Frontend
        F1[Login Page] -->|POST /api/auth/login| B1[Backend Auth]
        F2[Store JWT in localStorage]
        F3[Axios interceptor adds Authorization header]
        F4[Protected UI pages]
    end
    subgraph Backend
        B1[AuthController.login]
        B1 -->|bcrypt.compare| DB[User table (SQLite)]
        B1 -->|jwt.sign| JWT[JWT token]
        JWT --> F2
        subgraph ProtectedRoutes
            PR[authenticate middleware]
            PR -->|jwt.verify| JWT
            PR --> Controllers[Business logic]
        end
    end
```

---

## 9. Where to Find the Code
| Concern | File Path (backend) |
|---------|--------------------|
| Config & env vars | `src/config/env.ts` |
| Prisma client instance | `dist/utils/prisma.js` (generated) |
| JWT utilities | `src/utils/jwt.utils.ts` |
| Auth controller (register/login) | `src/controllers/auth.controller.ts` |
| Auth middleware | `src/middleware/auth.middleware.ts` |
| User model (Prisma) | `prisma/schema.prisma` |

---

**That completes the architectural overview.**  Let me know if you need deeper details on any specific component (e.g., database seeding, role‑based guards, or UI design).
