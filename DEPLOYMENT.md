# Production Deployment Guide

This guide describes operational procedures for provisioning, configuring, packaging, and deploying the Event Booking System in staging and production environments.

---

## Table of Contents

- [System Requirements](#system-requirements)
- [Environment Configuration](#environment-configuration)
- [Database Provisioning](#database-provisioning)
- [Application Packaging](#application-packaging)
- [Standalone Linux Deployment](#standalone-linux-deployment)
- [Containerized Deployment (Docker)](#containerized-deployment-docker)
- [Reverse Proxy Configuration (Nginx)](#reverse-proxy-configuration-nginx)
- [Transport Layer Security (TLS)](#transport-layer-security-tls)
- [Health Checks and Observability](#health-checks-and-observability)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting Reference](#troubleshooting-reference)

---

## System Requirements

| Component | Minimum Specification | Recommended Production Specification |
|---|---|---|
| Operating System | Ubuntu 22.04 LTS / RHEL 9 | Ubuntu 24.04 LTS / Debian 12 |
| Java Runtime | OpenJDK 17 (Eclipse Temurin) | OpenJDK 17 64-bit Server VM |
| Node.js Runtime | Node.js 18.x (build stage only) | Node.js 20.x LTS |
| Database Engine | PostgreSQL 16+ | PostgreSQL 16+ with SSD storage |
| Caching Engine | In-memory fallback | Redis 7.x Cluster or Sentinel |
| Reverse Proxy | Nginx 1.24+ | Nginx 1.26+ |
| CPU / Memory | 2 Cores / 2 GB RAM | 4+ Cores / 8+ GB RAM |

---

## Environment Configuration

Configure the following environment variables in production. Default fallback credentials present in development properties files must be overridden.

### Mandatory Parameters

| Variable | Description | Production Example |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `production` |
| `DB_URL` | JDBC database connection string | `jdbc:postgresql://db.internal:5432/event_booking_db` |
| `DB_USERNAME` | Database role identifier | `event_app_user` |
| `DB_PASSWORD` | Database role password | `[Managed Secret]` |
| `JWT_SECRET` | 256-bit Base64-encoded HMAC signing key | `[Managed 256-bit Base64 Key]` |
| `CORS_ALLOWED_ORIGINS` | Permitted cross-origin browser domains | `https://events.example.com` |

### Optional Operational Parameters

| Variable | Default Value | Description |
|---|---|---|
| `JWT_EXPIRATION` | `86400000` (24h) | Access token lifespan in milliseconds |
| `JWT_REFRESH_EXPIRATION` | `604800000` (7d) | Refresh token lifespan in milliseconds |
| `CACHE_TYPE` | `redis` | Caching provider (`redis` or `simple`) |
| `REDIS_HOST` | `localhost` | Redis server hostname |
| `REDIS_PORT` | `6379` | Redis server port |
| `MAIL_HOST` | `smtp.gmail.com` | Outgoing SMTP host |
| `MAIL_PORT` | `587` | Outgoing SMTP port |
| `MAIL_USERNAME` | None | SMTP authentication username |
| `MAIL_PASSWORD` | None | SMTP authentication password |
| `SEAT_LOCK_TIMEOUT` | `10` | Seat lock hold window in minutes |

### Secret Key Generation
Generate a secure 256-bit cryptographic secret for `JWT_SECRET`:

```bash
openssl rand -base64 32
```

---

## Database Provisioning

### 1. Database and Role Creation
Connect to your PostgreSQL cluster using administrative privileges:

```sql
CREATE DATABASE event_booking_db;
CREATE USER event_app_user WITH PASSWORD 'ReplaceWithSecurePassword';
GRANT ALL PRIVILEGES ON DATABASE event_booking_db TO event_app_user;
```

### 2. Schema Strategy
In production environments, ensure schema validation is enforced rather than automatic alteration:

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
```

### 3. Connection Pool Configuration
HikariCP pool sizing should be tuned based on available database connection limits and core concurrency:

```properties
spring.datasource.hikari.maximum-pool-size=25
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.max-lifetime=1800000
```

---

## Application Packaging

Compile and assemble production binaries:

### Backend JAR
```bash
./mvnw clean package -DskipTests
```
The executable archive is output to `target/event-booking-system-0.0.1-SNAPSHOT.jar`.

### Frontend Assets
```bash
cd frontend
npm ci
npm run build
```
Optimized static bundles are output to `frontend/dist/`.

---

## Standalone Linux Deployment

### Systemd Service Setup
Provision a dedicated unprivileged user and service descriptor:

```bash
sudo useradd -r -s /bin/false appuser
sudo mkdir -p /opt/event-booking-system
sudo chown -R appuser:appuser /opt/event-booking-system
```

Copy the compiled JAR and configure `/etc/systemd/system/event-booking.service`:

```ini
[Unit]
Description=Event Booking System Backend
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/event-booking-system
EnvironmentFile=/opt/event-booking-system/.env
ExecStart=/usr/bin/java \
  -Xms1024m -Xmx2048m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Djava.security.egd=file:/dev/./urandom \
  -jar event-booking-system-0.0.1-SNAPSHOT.jar
Restart=on-failure
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

Enable and activate the unit:

```bash
sudo systemctl daemon-reload
sudo systemctl enable event-booking
sudo systemctl start event-booking
```

---

## Containerized Deployment (Docker)

### Backend Dockerfile
```dockerfile
FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY target/event-booking-system-0.0.1-SNAPSHOT.jar app.jar
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-Xms1024m", "-Xmx2048m", "-XX:+UseG1GC", "-jar", "app.jar"]
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:1.26-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Configuration
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: event_booking_db
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

  redis:
    image: redis:7-alpine
    restart: always
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    environment:
      SPRING_PROFILES_ACTIVE: production
      DB_URL: jdbc:postgresql://postgres:5432/event_booking_db
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      CACHE_TYPE: redis
      REDIS_HOST: redis
      REDIS_PORT: 6379
      CORS_ALLOWED_ORIGINS: https://events.example.com
    depends_on:
      - postgres
      - redis
    ports:
      - "127.0.0.1:8080:8080"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## Reverse Proxy Configuration (Nginx)

Deploy Nginx as the TLS termination point and load balancer.

```nginx
server {
    listen 80;
    server_name events.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name events.example.com;

    ssl_certificate /etc/letsencrypt/live/events.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/events.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Static Frontend
    location / {
        root /var/www/event-booking/dist;
        try_files $uri $uri/ /index.html;
    }

    # REST API Gateway
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
    }

    # STOMP WebSocket Gateway
    location /ws/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # Health Check Probe (Internal Network Only)
    location /actuator/health {
        proxy_pass http://127.0.0.1:8080;
        allow 10.0.0.0/8;
        allow 127.0.0.1;
        deny all;
    }
}
```

---

## Transport Layer Security (TLS)

Acquire and configure automated certificates using Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d events.example.com
```

Confirm automatic renewal timers:

```bash
sudo systemctl status certbot.timer
```

---

## Health Checks and Observability

### Endpoint Reference

| Endpoint | Probe Type | Permitted Access |
|---|---|---|
| `GET /actuator/health` | Liveness / Readiness | Internal / Monitoring Agents |
| `GET /actuator/info` | Application Metadata | Internal |
| `GET /actuator/metrics` | Micrometer Telemetry | Role `ADMIN` |
| `GET /api/admin/system-health` | Diagnostic Telemetry | Role `ADMIN` |

### Sample Liveness Check Response
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "redis": {
      "status": "UP",
      "details": {
        "version": "7.2.4"
      }
    },
    "diskSpace": {
      "status": "UP"
    }
  }
}
```

---

## Performance Optimization

1. **JPA Query Optimization**: Confirm `spring.jpa.show-sql=false` to eliminate console I/O bottlenecks.
2. **Database Sizing**: Allocate shared buffers to approximately 25% of total server RAM. Ensure `work_mem` is tuned for sort operations on booking analytics queries.
3. **Caching**: Ensure `CACHE_TYPE=redis` is active to alleviate repeated lookups on catalog feeds (`/api/events/popular`, `/api/events/trending`).
4. **Rate Limiting Thresholds**: Evaluate `app.rate-limiting.capacity`. Under heavy production load, adjust capacity to 60-120 requests per minute per IP if required.

---

## Troubleshooting Reference

| Symptom | Probable Root Cause | Resolution Step |
|---|---|---|
| `Connection refused: postgresql:5432` | Database process stopped or bind address misconfigured | Confirm PostgreSQL service status (`systemctl status postgresql`) and verify `listen_addresses` in `postgresql.conf`. |
| `SignatureException: JWT signature does not match` | Mismatched `JWT_SECRET` key | Ensure `JWT_SECRET` is persistent across all container instances and service restarts. |
| `HTTP 403 Forbidden` on browser requests | CORS policy violation | Add public frontend origin domain to `CORS_ALLOWED_ORIGINS`. |
| `HTTP 429 Too Many Requests` | Burst requests exceeding Bucket4j allocation | Verify reverse proxy passes real client IP via `X-Forwarded-For`; tune `app.rate-limiting.capacity`. |
| WebSocket handshakes fail (`400` or `502`) | Reverse proxy missing `Upgrade` header mapping | Verify Nginx contains `Upgrade $http_upgrade` and `Connection "upgrade"` inside `location /ws/`. |
| `OutOfMemoryError: Java heap space` | Undersized heap memory under load | Increase JVM allocation flags: `-Xms2048m -Xmx4096m`. |
