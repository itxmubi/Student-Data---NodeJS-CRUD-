# 🐳 Running studentCrud with Docker

## Files to add to your project

| File | Where to put it |
|---|---|
| `Dockerfile` | Root of your project (same level as `package.json`) |
| `docker-compose.yml` | Root of your project |
| `.dockerignore` | Root of your project |
| `db.js` | Replace `config/db.js` with this updated version |

---

## One-time setup

### 1. Stop XAMPP MySQL
Make sure XAMPP's MySQL is **stopped** — both use port 3306 and they'll conflict.

### 2. Place the files
Your project folder should look like this:
```
studentCrud/
├── Dockerfile          ← new
├── docker-compose.yml  ← new
├── .dockerignore       ← new
├── package.json
├── server.js
├── config/
│   └── db.js          ← replace with the new version
├── controllers/
├── routes/
└── ...
```

### 3. Install Docker Desktop
Download from https://www.docker.com/products/docker-desktop/ and make sure it's running (whale icon in menu bar).

---

## Running the app

```bash
# From your project root (where docker-compose.yml lives):

# Start everything (MySQL + Node app)
docker compose up

# Or run in background (detached mode)
docker compose up -d

# Stop everything
docker compose down

# Stop and delete the database volume (full reset)
docker compose down -v
```

Your app will be available at: **http://localhost:8000**

---

## Viewing logs

```bash
# All logs
docker compose logs -f

# Just the Node app
docker compose logs -f app

# Just MySQL
docker compose logs -f db
```

---

## Connecting to MySQL directly (like phpMyAdmin)

You can connect any MySQL client (TablePlus, DBeaver, etc.) to:
- **Host:** localhost
- **Port:** 3306
- **User:** root
- **Password:** rootpassword
- **Database:** student_db

---

## Common issues

| Problem | Fix |
|---|---|
| Port 3306 already in use | Stop XAMPP MySQL first |
| Port 8000 already in use | Change `"8000:8000"` to `"8001:8000"` in docker-compose.yml |
| App crashes on start | MySQL isn't ready yet — just run `docker compose up` again, the healthcheck handles this |
| DB changes lost after restart | Make sure the `mysql_data` volume exists — run `docker compose down` (without `-v`) |