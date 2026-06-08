# TaskFlow API

A **scalable REST API** with JWT authentication, role-based access control (RBAC), and a React frontend — built with Node.js, Express, Prisma ORM, and PostgreSQL.

## Features

- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 🛡️ **Role-Based Access** — USER and ADMIN roles with granular permissions
- ✅ **Full CRUD** — Create, read, update, delete tasks with ownership enforcement
- 📖 **Swagger Docs** — Auto-generated interactive API documentation
- ⚡ **React Frontend** — Modern dark-themed UI with glassmorphism design
- 🔒 **Security Hardened** — Helmet, CORS, rate limiting, input validation (Zod)
- 📝 **Winston Logging** — Structured logging to console and rotating log files

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt (salt rounds: 12) |
| Validation | Zod |
| API Docs | swagger-jsdoc + swagger-ui-express |
| Frontend | React 19 (Vite) + Axios + React Router 7 |
| Logging | Winston |

---

## Setup

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14 (running locally or via Docker)
- **npm** ≥ 9

### Backend

```bash
# 1. Navigate to backend
cd backend

# 2. Copy environment variables
cp .env.example .env

# 3. Edit .env — set your DATABASE_URL, JWT_SECRET, etc.
#    DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow?schema=public
#    JWT_SECRET=your_very_long_random_secret_here

# 4. Install dependencies
npm install

# 5. Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev --name init

# 6. Start the development server
npm run dev
```

The API will be running at **http://localhost:5000**.

### Frontend

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The frontend will be running at **http://localhost:5173**.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret key for JWT signing (64+ chars) | — |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Create account, return JWT | ✗ |
| POST | `/login` | Authenticate, return JWT | ✗ |

### Tasks — `/api/v1/tasks`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List tasks (own for USER, all for ADMIN) | ✓ |
| POST | `/` | Create a new task | ✓ |
| GET | `/:id` | Get single task (owner/admin) | ✓ |
| PUT | `/:id` | Update task (owner/admin) | ✓ |
| DELETE | `/:id` | Delete task (owner/admin) | ✓ |

### Admin — `/api/v1/admin`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List all users | ADMIN |
| DELETE | `/users/:id` | Delete a user | ADMIN |

---

## API Docs

Interactive Swagger UI is available at:

```
http://localhost:5000/api/v1/docs
```

---

## Project Structure

```
taskflow/
├── backend/
│   ├── prisma/schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                   # DB, Swagger config
│   │   ├── middleware/               # Auth, RBAC, validation, error handling
│   │   ├── modules/
│   │   │   ├── auth/                 # Register & login
│   │   │   ├── tasks/               # Task CRUD
│   │   │   └── admin/               # User management
│   │   ├── utils/                    # Response helpers, logger
│   │   └── app.js                    # Express application
│   ├── server.js                     # Entry point
│   ├── .env.example                  # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                      # Axios instance & API calls
│   │   ├── components/               # Navbar, TaskCard, TaskModal, Toast
│   │   ├── context/                  # AuthContext
│   │   ├── pages/                    # Login, Register, Dashboard
│   │   └── App.jsx                   # Root component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── README.md
└── SCALABILITY.md
```

---

## License

MIT
