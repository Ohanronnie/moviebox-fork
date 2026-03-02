# Deployment Guide

To deploy your MovieBox API backend with Caddy and Docker Compose:

### 1. Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.
- DNS for `movie.itoolsai.com` pointing to your server's public IP.

### 2. Deployment Steps

From the `server` directory, run:

```bash
docker compose up -d --build
```

### 3. What this does:
- Starts the **App** container running the FastAPI backend.
- Starts the **Caddy** container acting as a reverse proxy.
- **Auto SSL:** Caddy will automatically provision a Let's Encrypt SSL certificate for `movie.itoolsai.com`.
- **Port Mapping:** Exposes ports `80` (HTTP) and `443` (HTTPS).

### 4. Configuration Check:
- Your API will be accessible at: `https://movie.itoolsai.com`
- Swagger Docs: `https://movie.itoolsai.com/docs`

---
*Note: Ensure your cloud firewall (AWS, DigitalOcean, etc.) has ports 80 and 443 open to the public.*
