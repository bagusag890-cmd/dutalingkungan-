# Duta Inisiatif Jabar Batch 14 - Dockerized Website

## 1. Project overview
Official website of Duta Inisiatif Batch 14 West Java. It is a static site (HTML/CSS/JS)
with these pages: Home, Struktur, Program Kerja, Layanan Laporan (form) and a 404 page.
All site files are in the `y/` folder and are served by nginx inside the container.

**Core feature used for verification:** the Struktur page (member posts with like and comment).

No database, no build step, no secrets.

## 2. Prerequisites
- Docker Desktop 4.95.0 (macOS) with Docker Compose v2
- Git
- Internet connection (fonts, icons and analytics load from CDNs)

## 3. Clone and configure
```bash
git clone https://github.com/bagusag890-cmd/dutalingkungan-.git
cd dutalingkungan-
git checkout chore/dockerize-week6
cp .env.example .env
```

| Variable | Meaning | Default |
|---|---|---|
| `HOST_PORT` | Port on your computer | `8081` |
| `IMAGE_NAME` | Image name and tag | `group08/dutifjabar14:week6` |

The real `.env` is never committed. `.env.example` only contains safe default values.

## 4. Build and run
```bash
docker compose up --build -d
```

Without Compose:
```bash
docker build -t group08/dutifjabar14:week6 .
docker run -d --name dutifjabar14-web -p 8081:80 group08/dutifjabar14:week6
```

## 5. URL and ports
- App: http://localhost:8081
- Host port `8081` maps to container port `80`.

## 6. Verify it works
| ID | Check | Expected result |
|---|---|---|
| V-01 | `docker compose ps` | Service `web` is `running` (healthy) |
| V-02 | `curl -I http://localhost:8081` | `HTTP/1.1 200 OK` |
| V-03 | Open http://localhost:8081/struktur.html, like a post and add a comment | Like count increases and the comment appears |
| V-04 | `docker compose restart`, then reload the page | The site loads again without errors |

## 7. Logs and status
```bash
docker compose ps
docker compose logs -f
docker inspect dutifjabar14-web
docker exec -it dutifjabar14-web sh
```

## 8. Stop and clean up
```bash
docker compose down
docker image rm group08/dutifjabar14:week6   # optional
```

## 9. Troubleshooting and known limitations
- **Port already in use:** change `HOST_PORT` in `.env` (for example `8082`) and run `docker compose up -d` again.
  Use `docker ps` to see which container uses the port.
- **Browser cannot connect:** run `docker compose ps` and check that the port mapping is `HOST_PORT:80`.
- **Photos not showing in Chrome or Firefox:** many photos are `.heic`, which only Safari displays
  natively. This comes from the original site, not from Docker.
- **Fonts and icons missing:** they load from CDNs, so internet is required.
- **Like and comment data** is saved in the browser's localStorage, so it is per browser and not shared.
- **Layanan Laporan form** posts to the external service formsubmit.co, so it needs internet.
