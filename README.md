# Smart Campus Connect

Real-Time Communication Platform for Colleges — centralized student and faculty messaging with live announcements.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Java 17, Spring Boot 3, Spring Security, JWT, WebSocket (STOMP), PostgreSQL, Maven |
| Frontend | React 18, Vite, Tailwind CSS, Axios, SockJS, STOMP.js |

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

## Database Setup

```sql
CREATE DATABASE campus_connect;
```

## Environment Variables

### Backend (`backend/src/main/resources/application.properties` or env vars)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/campus_connect` | PostgreSQL JDBC URL |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | (see application.properties) | JWT signing secret (min 256 bits) |
| `JWT_EXPIRATION_MS` | `86400000` | Token expiry (24h) |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origins |
| `SERVER_PORT` | `8080` | Backend port |

## Production environment variables (important)

- **DB_URL**, **DB_USERNAME**, **DB_PASSWORD**: Must be provided by your deployment environment. Do not commit production DB credentials to source control.
- **JWT_SECRET**: Must be provided in production; there is no fallback value. Use a strong secret (>= 256 bits) and store it in a secrets manager or CI/CD secret store.
- **CORS_ORIGINS**: Set to your frontend origin(s) in production (do not use wildcard *).

Example (Linux export):

```bash
export DB_URL=jdbc:postgresql://db-host:5432/campus_connect
export DB_USERNAME=app_user
export DB_PASSWORD=strong_password_here
export JWT_SECRET="a-very-long-secret-at-least-32-bytes"
```

Ensure secrets are injected by your orchestrator (Docker, Kubernetes, or CI) and never committed.

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
```

## Run Commands

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Push to GitHub and CI

This repo includes a GitHub Actions workflow that builds the backend JAR and the frontend `dist` on push to `main`.

Before pushing, ensure you have removed/rotated any leaked credentials and set repository secrets for production deployments:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (if building/running in CI)
- `JWT_SECRET` (required for production runtime)
- Optionally: `DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD` to enable automatic image pushes (workflow optional step)

To push:

```bash
git init
git add .
git commit -m "Prepare repo for deployment: add Dockerfiles and CI"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```


## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Users (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users?search=john` | Search users |
| GET | `/api/users?role=STUDENT` | Filter by role |
| GET | `/api/users/{id}` | Get user by ID |

### Messages (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversation/{userId}` | Get chat history |
| POST | `/api/messages` | Send message (REST fallback) |
| PUT | `/api/messages/{id}/read` | Mark message as read |

### Announcements (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/announcements` | List announcements |
| GET | `/api/announcements/{id}` | Get announcement |
| POST | `/api/announcements` | Create (Teacher/Admin only) |

### WebSocket (STOMP over SockJS)
| Destination | Description |
|-------------|-------------|
| `/ws` | SockJS endpoint |
| `/app/chat.send` | Send private message |
| `/user/queue/messages` | Receive private messages |
| `/topic/announcements` | Live announcement feed |
| `/topic/presence` | User online/offline updates |

## Default Roles

- **STUDENT** — Chat, read announcements
- **TEACHER** — Chat, create announcements
- **ADMIN** — Full access
