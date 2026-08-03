# 🚀 Deployment Guide — Event Booking System

This document provides instructions for deploying the Event Booking System to production environments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Docker Deployment](#docker-deployment)
- [Reverse Proxy (Nginx)](#reverse-proxy-nginx)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Health Checks](#health-checks)
- [Performance Tuning](#performance-tuning)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Version | Purpose |
|---|---|---|
| Java JDK | 17+ | Backend runtime |
| Node.js | 18+ | Frontend build |
| PostgreSQL | 16+ | Primary database |
| Redis | 7+ | Caching (production recommended) |
| Nginx | 1.24+ | Reverse proxy (optional) |

---

## Environment Variables

Configure these environment variables in your production environment:

### Required

| Variable | Example | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://db-host:5432/event_booking_db` | PostgreSQL JDBC URL |
| `DB_USERNAME` | `event_user` | Database username |
| `DB_PASSWORD` | `<strong-password>` | Database password |
| `JWT_SECRET` | `<base64-encoded-256-bit-key>` | JWT signing secret (min 256 bits) |
| `APP_BASE_URL` | `https://yourdomain.com` | Public-facing base URL |
| `CORS_ALLOWED_ORIGINS` | `https://yourdomain.com` | Frontend domain(s) |

### Optional

| Variable | Default | Description |
|---|---|---|
| `JWT_EXPIRATION` | `86400000` (24h) | Access token expiry in ms |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7d) | Refresh token expiry in ms |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | — | SMTP username |
| `MAIL_PASSWORD` | — | SMTP password |
| `MAIL_FROM` | `noreply@eventbookingsystem.com` | Sender email |
| `CACHE_TYPE` | `simple` | `simple` or `redis` |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `SEAT_LOCK_TIMEOUT` | `10` | Seat lock timeout in minutes |

### Generate a Secure JWT Secret

```bash
# Generate a 256-bit base64-encoded secret
openssl rand -base64 32
```

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE event_booking_db;
CREATE USER event_user WITH PASSWORD '<strong-password>';
GRANT ALL PRIVILEGES ON DATABASE event_booking_db TO event_user;
```

### 2. Schema Migration

The application uses `spring.jpa.hibernate.ddl-auto=update`, which auto-creates and updates tables on startup. For production, consider:

- Switch to `validate` after initial deployment
- Use Flyway or Liquibase for migration versioning

### 3. Connection Pooling

For production, configure HikariCP pool settings:

```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=20000
```

---

## Backend Deployment

### Option 1: JAR Deployment

```bash
# Build the production JAR
./mvnw clean package -DskipTests

# Run with environment variables
java -jar target/event-booking-system-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=production
```

### Option 2: Systemd Service (Linux)

Create `/etc/systemd/system/event-booking.service`:

```ini
[Unit]
Description=Event Booking System
After=network.target postgresql.service

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/event-booking-system
ExecStart=/usr/bin/java -jar -Xms512m -Xmx1024m event-booking-system-0.0.1-SNAPSHOT.jar
EnvironmentFile=/opt/event-booking-system/.env
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable event-booking
sudo systemctl start event-booking
```

### JVM Tuning

```bash
java -jar \
  -Xms512m \
  -Xmx1024m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Djava.security.egd=file:/dev/./urandom \
  event-booking-system-0.0.1-SNAPSHOT.jar
```

---

## Frontend Deployment

### Build for Production

```bash
cd frontend
npm install
npm run build
```

This creates optimized static files in `frontend/dist/`.

### Serve Static Files

**Option A**: Serve via Nginx (recommended)

**Option B**: Serve via Spring Boot static resources — copy `dist/` contents to `src/main/resources/static/`

**Option C**: Deploy to a CDN or static hosting (Vercel, Netlify, Cloudflare Pages)

---

## Docker Deployment

### Dockerfile (Backend)

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/event-booking-system-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Xms512m", "-Xmx1024m", "app.jar"]
```

### Dockerfile (Frontend)

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: event_booking_db
      POSTGRES_USER: event_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/event_booking_db
      DB_USERNAME: event_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CACHE_TYPE: redis
      REDIS_HOST: redis
      CORS_ALLOWED_ORIGINS: http://localhost
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

---

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/event-booking/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Swagger UI
    location /swagger-ui/ {
        proxy_pass http://localhost:8080;
    }

    # Actuator (restrict to internal)
    location /actuator/ {
        proxy_pass http://localhost:8080;
        allow 127.0.0.1;
        deny all;
    }
}
```

---

## SSL/TLS Configuration

### Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certificates auto-renew via cron.

---

## Health Checks

| Endpoint | Purpose | Access |
|---|---|---|
| `GET /actuator/health` | Application health status | Public |
| `GET /actuator/info` | Application info | Public |
| `GET /actuator/metrics` | JVM & app metrics | Admin only |

### Health Check Response

```json
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" },
    "ping": { "status": "UP" }
  }
}
```

---

## Performance Tuning

### Production Recommendations

| Setting | Recommendation |
|---|---|
| `spring.jpa.show-sql` | Set to `false` |
| `spring.jpa.hibernate.ddl-auto` | Set to `validate` |
| `CACHE_TYPE` | Set to `redis` |
| Rate limiting capacity | Increase to `50-100` for production traffic |
| JVM heap | `-Xms512m -Xmx1024m` minimum |
| DB connection pool | 20-50 connections |
| File uploads directory | Use cloud storage (S3) instead of local `uploads/` |

### Disable Dev Features

```properties
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
```

---

## Monitoring

### Spring Actuator Endpoints

Already configured at `/actuator/health`, `/actuator/info`, and `/actuator/metrics`.

### Log Aggregation

Application logs structured audit events via `AuditLogger`:
- Login events
- Booking creation/cancellation
- Payment processing
- Event management

Logs can be aggregated with ELK Stack (Elasticsearch, Logstash, Kibana) or similar tools.

### Recommended Stack

| Tool | Purpose |
|---|---|
| Prometheus | Metrics collection |
| Grafana | Metrics visualization |
| ELK Stack | Log aggregation |
| PgAdmin | Database monitoring |

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|---|---|---|
| `Connection refused: PostgreSQL` | Database not running | Start PostgreSQL service |
| `JWT signature invalid` | Wrong `JWT_SECRET` | Ensure consistent secret across restarts |
| `CORS error in browser` | Frontend origin not in allowed list | Update `CORS_ALLOWED_ORIGINS` |
| `Too Many Requests (429)` | Rate limit exceeded | Wait 60 seconds or increase `app.rate-limiting.capacity` |
| `File upload failed` | File >20MB or `uploads/` not writable | Check file size and directory permissions |
| `WebSocket connection failed` | Firewall blocking `/ws/` | Enable WebSocket in proxy/firewall |
| `OutOfMemoryError` | Insufficient JVM heap | Increase `-Xmx` value |
