# Payload CMS - Quick Reference

## Status: ✅ Running & Production Ready

---

## Fastest Start

```bash
cd ~/vacatia/payload-cms
docker-compose up -d
```

**Admin Panel:** http://localhost:4001
**Email:** admin@payloadcms.com | **Password:** admin123

---

## Essential Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up -d` | Start all services |
| `docker-compose down` | Stop services |
| `docker-compose logs -f payload` | View logs |
| `npm run build` | Compile TypeScript |
| `npm run dev` | Dev server (localhost:3000) |
| `git push origin main` | Push to GitHub |

---

## Collections (7)

Users • Regions • Properties • Amenities • POIs • Events • ProviderMappings

---

## Ports

| Service | External | Internal | Access |
|---------|----------|----------|--------|
| Payload CMS | 4001 | 3000 | http://localhost:4001 |
| PostgreSQL | 5432 | 5432 | localhost:5432 |

---

## File Structure

```
src/
  ├── collections/ (7 collection files)
  ├── payload.config.ts
  └── server.ts
dist/               (Compiled)
docker-compose.yml
Dockerfile
.env.local
```

---

## Key Files

- **payload.config.ts** - All collections + CORS + database config
- **.env.local** - DATABASE_URI, PAYLOAD_SECRET
- **docker-compose.yml** - Services definition
- **SESSION_EXPORT.md** - Full documentation

---

## Common Tasks

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

### View Database
```bash
psql -h localhost -U search_poc -d payload_cms
```

### Rebuild Docker Image
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Push to GitHub
```bash
git add .
git commit -m "message"
git push origin main
```

---

## Environment

```
DATABASE_URI=postgresql://search_poc:search_poc_pass@postgres:5432/payload_cms
PAYLOAD_SECRET=your-secret-key-change-this-in-production
PORT=3000
```

---

## API Base URL

http://localhost:4001/api/

**Endpoints:** `/users`, `/regions`, `/properties`, `/amenities`, `/pois`, `/events`, `/provider-mappings`

---

## GitHub

Repository: https://github.com/vacatia/payload-cms
Last Commit: `0d77655` - Add session export documentation

---

## Issues?

1. **Containers won't start:** `docker-compose build --no-cache && docker-compose up -d`
2. **Can't access admin:** Wait 10 seconds, check logs
3. **DB connection fails:** Verify DATABASE_URI in .env.local
4. **Need to debug:** `docker-compose logs -f payload`

---

## Full Details

See **SESSION_EXPORT.md** for comprehensive documentation.
