# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Payload CMS v3** with a custom Express server wrapper for the Vacatia property management system. It's a headless CMS providing REST APIs for 7 collections: Users, Regions, Properties, Amenities, POIs, Events, and Provider Mappings.

### Architecture

**Technology Stack:**
- **Framework**: Payload CMS v3 (with Next.js 15 integration)
- **Server**: Express + Next.js (Express wraps Next.js for custom routing)
- **Database**: PostgreSQL 16 with PostGIS extension
- **Rich Text**: Lexical editor
- **ORM**: Drizzle (used internally by Payload)
- **Language**: TypeScript

**Key Architecture Decisions:**
1. **Custom Express Server**: Payload v3 runs on Next.js, but we wrap it with Express to expose custom REST API routes (`/api/:collection` pattern)
2. **Database Schema**: Uses PostgreSQL with PostGIS for geographic queries. Schema is defined via Payload collections and initialized via `init.sql` workaround (Payload v3 issue #5822)
3. **Route Ordering**: Specific routes (`/api/health`) must be defined before generic routes (`/api/:collection`) to prevent mismatching

### File Structure

```
src/
  ├── server.ts              # Express server entry point (imports Next.js after prepare)
  ├── payload.config.ts      # Payload CMS configuration (collections, CORS, database)
  ├── collections/           # Collection definitions
  │   ├── Users.ts          # Auth collection
  │   ├── Regions.ts
  │   ├── Properties.ts
  │   ├── Amenities.ts
  │   ├── POIs.ts
  │   ├── Events.ts
  │   └── ProviderMappings.ts
  └── payload-types.ts       # Auto-generated TypeScript types

next.config.ts              # Next.js config with Payload integration
Dockerfile                  # Multi-stage build with tsx for TypeScript/ESM
docker-compose.yml         # PostgreSQL + Payload CMS services
init.sql                   # Workaround schema initialization for push: true bug
.env.local                 # Environment configuration (DATABASE_URI, PAYLOAD_SECRET)
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Build & Production
npm run build            # TypeScript compilation for production
npm start                # Start production server using compiled server.js

# Payload CLI
npm run payload          # Access Payload CLI utilities
```

## Docker Commands

```bash
# Full stack (recommended for development)
docker-compose up -d                 # Start PostgreSQL + Payload CMS
docker-compose down                  # Stop services
docker-compose down -v               # Stop and remove database volume

# Debugging
docker-compose logs -f payload       # View Payload CMS logs
docker-compose logs -f postgres      # View PostgreSQL logs
docker-compose ps                    # Check service status
docker-compose build --no-cache      # Rebuild image without cache

# Accessing database directly
psql -h localhost -U search_poc -d payload_cms
```

## Configuration

### Environment Variables (.env.local)

```
DATABASE_URI=postgresql://search_poc:search_poc_pass@postgres:5432/payload_cms
PAYLOAD_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
PORT=3000
```

### Collections Configuration

All collections are defined in `src/payload.config.ts` with their configuration and fields:

- **Users**: Authentication-enabled collection (auth: true)
- **Regions**: Geographic regions with slug (unique) and rich text description
- **Properties**: Holiday properties with relationships to Regions
- **Amenities**: Services/facilities with type select fields
- **POIs**: Tourist attractions with geographic coordinates
- **Events**: Local events with date and venue information
- **Provider Mappings**: External provider integration records

### CORS & CSRF

Configured origins in `src/payload.config.ts`:
- `http://localhost:4001` (docker-compose external)
- `http://localhost:8001` (search-poc frontend)
- `http://localhost:3000` (dev server)

Update these for production deployments.

## REST API Endpoints

All endpoints follow the pattern `/api/:collection/:id` with standard HTTP methods:

```bash
GET    /api/regions              # List all
POST   /api/regions              # Create
GET    /api/regions/:id          # Get one
PATCH  /api/regions/:id          # Update
DELETE /api/regions/:id          # Delete
```

Collections: `users`, `regions`, `properties`, `amenities`, `pois`, `events`, `provider-mappings`

**Health Endpoints:**
- `GET /health` - Basic health check
- `GET /api/health` - API-specific health check (for Docker healthchecks)

## Important Implementation Details

### Server Initialization Flow

The server follows this sequence in `src/server.ts`:

1. Initialize Next.js app and wait for preparation: `nextApp.prepare().then()`
2. Import Payload: `getPayload({ config })`
3. Create Express instance
4. Define routes (specific → generic order):
   - `/health` and `/api/health`
   - Collection CRUD routes `/api/:collection`, `/api/:collection/:id`
   - Catch-all `*` routed to Next.js handler
5. Start listening

**Critical**: Specific routes must come before generic routes. The `/api/health` route must be before `/api/:collection` to prevent "health" from being interpreted as a collection name.

### Database Schema Management

Payload v3's `push: true` doesn't reliably create tables (GitHub issue #5822). Workaround:
- `init.sql` is mounted as `/docker-entrypoint-initdb.d/init.sql` in postgres service
- Runs automatically on first container startup
- Uses snake_case column names (`created_at`, `updated_at`) matching Drizzle expectations

If modifying collection schemas:
1. Update collection definition in `src/collections/`
2. Regenerate `init.sql` if needed or ensure Payload can create tables

### TypeScript Compilation

The build process:
```bash
npm run build  # Runs: next build && tsc src/server.ts --outDir . --module commonjs
```

- `next build` compiles the Next.js app to `.next/`
- `tsc` compiles `src/server.ts` to `server.js` for production execution
- Uses `tsx` in Dockerfile to handle TypeScript and ESM at runtime

**Note**: `tsx` is used instead of `node` in production to support TypeScript sources and ESM modules without separate compilation step if needed.

### Docker Healthchecks

PostgreSQL service has a healthcheck:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U search_poc -d payload_cms"]
  interval: 5s
  retries: 5
  start_period: 10s
```

Payload depends on this with `condition: service_healthy` to ensure database is ready before connecting.

## Common Development Tasks

### Reset Database (Clears All Data)
```bash
docker-compose down -v
docker-compose up -d
```

### Add a New Collection

1. Create `src/collections/NewCollection.ts` following the pattern of existing collections
2. Import in `src/payload.config.ts` and add to collections array
3. Add schema creation to `init.sql` if needed
4. Rebuild: `npm run build`
5. Restart: `docker-compose up -d --build`

### Add CORS Origin for Production

Update `src/payload.config.ts`:
```typescript
cors: [
  'http://localhost:4001',
  'http://localhost:8001',
  'http://localhost:3000',
  'https://yourdomain.com',  // Add here
],
```

### Debug Database Connection

```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Connect to database directly
psql -h localhost -U search_poc -d payload_cms

# Query tables
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Containers won't start | `docker-compose build --no-cache && docker-compose up -d` |
| Port 3000/4001 already in use | `lsof -i :3000` then `kill -9 <PID>` or change PORT in env |
| DB connection refused | Verify `DATABASE_URI` in `.env.local` and that postgres is healthy |
| Build failures | `rm -rf node_modules && npm install && npm run build` |
| API returns 404 for routes | Check route ordering in `src/server.ts` - specific before generic |

## Integration with search-poc

- Docker service name: `payload`
- Internal URL: `http://payload:3000`
- External/Admin: `http://localhost:4001`
- Both services share network: `payload-network`

The search-poc can access the Payload API at `http://payload:3000/api/` when running together via docker-compose.

## Production Deployment

1. Build Docker image: `docker build -t vacatia/payload-cms:latest .`
2. Push to registry: `docker push vacatia/payload-cms:latest`
3. In production docker-compose, use image reference and set environment:
   ```yaml
   services:
     payload:
       image: vacatia/payload-cms:latest
       environment:
         DATABASE_URI: postgresql://...
         PAYLOAD_SECRET: <secure-random-string>
         NODE_ENV: production
   ```
4. Change CORS origins to production domain
5. Ensure database backups are configured
6. Use strong PAYLOAD_SECRET

## Known Issues & Workarounds

### Issue: Payload v3 `push: true` not creating database tables
- **Status**: Payload GitHub issue #5822
- **Workaround**: Use `init.sql` for schema creation (already implemented)

### Issue: Route matching catches `/api/health` as collection
- **Status**: Fixed by explicit route definition
- **Fix**: `/api/health` route defined before `/api/:collection` in `src/server.ts`

## Payload CMS v3 Migration Notes

This repository successfully migrated from Payload v2 to v3. Key changes:
- Replaced Mongoose with Drizzle ORM
- Next.js integration is now mandatory (vs optional in v2)
- Rich text editor migrated from Slate to Lexical
- Collection configuration API remained similar
- Database adapter changed: `mongooseAdapter` → `postgresAdapter`
- Custom server now wraps Next.js instead of Payload directly

## References

- [Payload CMS v3 Documentation](https://payloadcms.com/docs)
- [Payload GitHub Repository](https://github.com/payloadcms/payload)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
