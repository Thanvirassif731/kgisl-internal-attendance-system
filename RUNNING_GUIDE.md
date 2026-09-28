# How to Run the Internal Attendance System (KITE) after Cloning

> This guide assumes you have just cloned the repository to your machine. No other files (e.g., `dev.db`) need to be copied.

## 1️⃣ Prerequisites
- **Node.js** (v18+) with **npm** (v9+). Install from https://nodejs.org/.
- **Git** (optional, only for cloning).
- **SQLite** is used as the local database – no extra installation required because the Node `sqlite3` driver handles it.

## 2️⃣ Clone the repository
```bash
git clone https://github.com/Thanvirassif731/kgisl-internal-attendance-system.git
cd <your‑folder‑name>
```
Replace `<your‑folder‑name>` with whatever directory name you chose when cloning.

## 3️⃣ Install dependencies (backend + frontend)
```bash
# Backend dependencies
cd backend
npm install

# Front‑end dependencies
cd ../frontend
npm install
```

## 4️⃣ Set up environment variables for the backend
Create a `.env` file inside the `backend` folder (you can copy the example):
```bash
cp .env.example .env   # if .env.example exists
```
Edit the file so it contains at least the following lines (you may change the secret values):
```
PORT=5000
DATABASE_URL=file:./dev.db   # SQLite file that will be created automatically
JWT_SECRET=your_secret_key   # replace with a strong secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
```
> **Important:** `dev.db` will be generated inside `backend/` on the first run; you do **not** need to commit or copy it.

## 5️⃣ Initialise the SQLite database schema (only the first time or after deleting `dev.db`)
```bash
cd backend
npx prisma generate   # generates the Prisma client
npx prisma db push    # creates/updates the SQLite file based on schema.prisma
```
Optionally seed demo data (if a seed script is defined):
```bash
npm run db:setup   # or the appropriate seed command
```

## 6️⃣ Run the two servers (open two terminal windows/panes)
### Backend API server
```bash
cd backend
npm run dev   # listens on http://localhost:5000
```
### Front‑end UI server
```bash
cd frontend
npm run dev   # Vite dev server on http://localhost:5173
```
The front‑end is configured to proxy API calls to `http://localhost:5000`.

## 7️⃣ Open the application
Open your browser and navigate to **http://localhost:5173**.

## 8️⃣ Demo login credentials
| Role | Username / Email | Password |
|------|------------------|----------|
| **Admin** | `admin` (or `admin@company.com`) | `admin123` |
| **Team member** | `ashfaq` (or `ashfaq.new@company.com`) | `user123` |

Use these to explore the dashboards.

## 9️⃣ Common commands & troubleshooting
- **Stop a server** – press `Ctrl + C` in its terminal.
- **Re‑create the database** – delete `backend/dev.db` then repeat step 5.
- **Port conflict** – change `PORT` in `.env` if something else uses `5000`.
- **`tsx` not found** – ensure you ran `npm install` after any cleanup; the backend uses `tsx` to run TypeScript.

---

You now have everything needed to run the Internal Attendance System on any computer that clones the repo. Happy coding!
