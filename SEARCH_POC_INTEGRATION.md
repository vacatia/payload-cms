# Payload CMS - Search POC Integration Guide

This document explains how to use Payload CMS with search-poc and addresses the three critical issues that were identified and fixed.

## Fixed Issues Summary

### ✅ Issue 1: Admin UI Returns 404 (FIXED)

**What was wrong:**
- `next.config.ts` had a comment disabling Payload admin routes
- Admin UI routes were not being automatically configured by `withPayload()`

**What was fixed:**
- Removed the comment that disabled automatic Payload route setup
- `withPayload()` now properly configures admin routes in Next.js App Router
- Admin UI is now available at `/admin`

**How to verify:**
```bash
# After deploying the fix, visit:
http://localhost:4001/admin

# You should see:
- Payload login screen (if not logged in)
- OR admin dashboard showing collections (if logged in)
```

**Status:** ✅ Ready for use

---

### ✅ Issue 2: REST API Ignores Pagination Parameters (FIXED)

**What was wrong:**
```javascript
// Before: Only passed collection and where
const result = await payload.find({ collection, where })
```

The `/api/:collection` route wasn't extracting or passing:
- `limit` - number of items per page
- `page` - which page to retrieve
- `sort` - sort order
- `depth` - relationship nesting depth

**What was fixed:**
```javascript
// After: Now extracts and passes all pagination parameters
const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined
const sort = (req.query.sort as string) || undefined
const depth = req.query.depth ? parseInt(req.query.depth as string, 10) : undefined

const result = await payload.find({
  collection,
  where,
  limit,
  page,
  sort,
  depth,
})
```

**How to verify:**
```bash
# Test with pagination
curl "http://localhost:4001/api/properties?limit=100"

# Should return:
{
  "docs": [...],
  "totalDocs": 20,
  "limit": 100,
  "page": 1,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}

# Test with page parameter
curl "http://localhost:4001/api/properties?limit=10&page=2"

# Test with sorting
curl "http://localhost:4001/api/properties?sort=-createdAt"
```

**Status:** ✅ Ready for use

---

### ✅ Issue 3: Hot-Reload Not Working (FIXED)

**What was wrong:**
- docker-compose.yml had `NODE_ENV: production`
- Production mode doesn't watch files for changes
- No volume mounts for source code
- Container ran with `CMD` from Dockerfile (production mode)

**What was fixed:**
Created `docker-compose.dev.yml` with:
```yaml
environment:
  NODE_ENV: development    # Enable watch mode
volumes:
  - ./src:/app/src        # Source code hot-reload
  - ./app:/app/app        # Next.js app directory
  - ./next.config.ts:/app/next.config.ts
  - node_modules:/app/node_modules
command: npm run dev      # Run development server
```

**How to use:**

**For Development (with hot-reload):**
```bash
# Use the development compose file
docker-compose -f docker-compose.dev.yml up -d

# Edit src/collections/Properties.ts
# Changes will auto-reload without rebuilding!

# View logs
docker-compose -f docker-compose.dev.yml logs -f payload
```

**For Production:**
```bash
# Use the production compose file (default)
docker-compose up -d

# Rebuilds are required for changes
docker-compose build --no-cache
docker-compose up -d
```

**How to verify hot-reload works:**
```bash
# 1. Start dev environment
docker-compose -f docker-compose.dev.yml up -d

# 2. Edit a collection file
# Example: src/collections/Properties.ts
# Change defaultLimit from 100 to 50

# 3. Watch logs for recompilation
docker-compose -f docker-compose.dev.yml logs -f payload

# You should see:
# ▲ Next.js 15.2.3
# - Local: http://localhost:3000
# ✓ Compiled successfully

# 4. Test the change
curl "http://localhost:4001/api/properties?limit=1000"
# Should now default to 50 if limit not specified
```

**Status:** ✅ Ready for use

---

## Integration with search-poc

### Option A: Use payload-cms as External Service (Recommended for Development)

In search-poc's `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_USER: search_poc
      POSTGRES_PASSWORD: search_poc_pass
      POSTGRES_DB: search_poc
    ports:
      - "5433:5432"  # Different port to avoid conflict
    volumes:
      - postgres_data:/var/lib/postgresql/data

  payload:
    build:
      context: ../payload-cms
      dockerfile: Dockerfile
    container_name: search_poc_payload
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URI: postgresql://search_poc:search_poc_pass@postgres:5432/payload_cms
      PAYLOAD_SECRET: your-secret-key-change-this-in-production
      NODE_ENV: production
      PORT: 3000
    ports:
      - "4001:3000"
    networks:
      - payload-network
    volumes:
      - ../payload-cms/src:/app/src          # Hot-reload for development
      - ../payload-cms/app:/app/app
      - ../payload-cms/next.config.ts:/app/next.config.ts

  # Your PHP/Symfony service
  php:
    build: .
    environment:
      PAYLOAD_BASE_URL: http://payload:3000/api
      PAYLOAD_ADMIN_URL: http://localhost:4001/admin
    ports:
      - "8000:80"
    networks:
      - payload-network

volumes:
  postgres_data:

networks:
  payload-network:
    driver: bridge
```

**Benefits:**
- Single docker-compose command starts everything
- Payload accessible at `http://payload:3000` from PHP service
- Admin UI accessible at `http://localhost:4001/admin`
- Easy to debug with shared logging

**Usage:**
```bash
cd search-poc
docker-compose up -d
```

### Option B: Use Separate Payload Instance

Run Payload CMS in its own directory:

```bash
cd payload-cms
docker-compose -f docker-compose.dev.yml up -d  # For development

# OR for production
docker-compose up -d
```

Then in search-poc, point to the external Payload instance:

```php
// In PayloadPropertyDirectoryService.php
$this->httpClient->request('GET', 'http://localhost:4001/api/properties', [
    'query' => ['limit' => 100]
]);
```

---

## Making Requests from search-poc

### Property Directory Service Example

```php
<?php
// search-poc/src/Search/Service/PayloadPropertyDirectoryService.php

class PayloadPropertyDirectoryService
{
    public function getProperties(int $limit = 100): array
    {
        $response = $this->httpClient->request('GET', 'http://payload:3000/api/properties', [
            'query' => [
                'limit' => $limit,
                'sort' => '-createdAt',
                'depth' => 2,  // Include relationships
            ]
        ]);

        $data = json_decode($response->getContent(), true);

        return $data['docs'];
    }

    public function getProperty(string $id): array
    {
        $response = $this->httpClient->request('GET', "http://payload:3000/api/properties/{$id}", [
            'query' => ['depth' => 3]
        ]);

        return json_decode($response->getContent(), true);
    }

    public function searchProperties(array $filters): array
    {
        $where = json_encode($filters);

        $response = $this->httpClient->request('GET', 'http://payload:3000/api/properties', [
            'query' => [
                'where' => $where,
                'limit' => 100,
            ]
        ]);

        $data = json_decode($response->getContent(), true);

        return $data['docs'];
    }
}
```

### Supported Query Parameters

```
GET /api/properties?limit=100&page=2&sort=-name&depth=2

Parameters:
- limit: number of items per page (default: 10)
- page: page number (default: 1)
- sort: field to sort by, prefix with - for descending (e.g., -createdAt)
- depth: how deep to populate relationships (0-10)
- where: JSON-encoded filter object (URL encoded)
```

---

## Testing the Fixes

### Test Admin UI
```bash
curl -I http://localhost:4001/admin
# Should return 200 OK, not 404
```

### Test Pagination
```bash
# Get first page
curl http://localhost:4001/api/properties?limit=5&page=1

# Get second page
curl http://localhost:4001/api/properties?limit=5&page=2

# Get all with custom limit
curl http://localhost:4001/api/properties?limit=100
```

### Test Hot-Reload
```bash
# In development mode (docker-compose.dev.yml)

# 1. Check current state
curl http://localhost:4001/api/regions | jq '.totalDocs'

# 2. Edit src/collections/Regions.ts
# Add a field or change something

# 3. Watch the logs
docker-compose -f docker-compose.dev.yml logs -f payload

# 4. After recompilation, test the change
curl http://localhost:4001/api/regions
```

---

## Environment Configuration

### Database Setup

Both services can share the same PostgreSQL instance:

```yaml
# Single PostgreSQL for both search-poc and payload-cms
postgres:
  image: postgis/postgis:16-3.4
  environment:
    POSTGRES_INITDB_ARGS: "-c max_connections=200"
  volumes:
    - postgres_data:/var/lib/postgresql/data
    # Both init scripts run in order:
    - ./search-poc-init.sql:/docker-entrypoint-initdb.d/01-search-poc.sql
    - ../payload-cms/init.sql:/docker-entrypoint-initdb.d/02-payload.sql
```

Payload CMS will use database: `payload_cms`
search-poc will use database: `search_poc`

Both on the same PostgreSQL instance.

---

## Troubleshooting

### Admin UI still returns 404

**Cause:** Cached docker image with old configuration

**Solution:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Pagination parameters ignored

**Cause:** Using old compiled code

**Solution:**
```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Hot-reload not working

**Cause:** Not using `docker-compose.dev.yml` or NODE_ENV not set to development

**Solution:**
```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Verify NODE_ENV
docker-compose -f docker-compose.dev.yml exec payload env | grep NODE_ENV
# Should output: NODE_ENV=development
```

### Database not initializing

**Cause:** init.sql not being run

**Solution:**
```bash
# Start fresh
docker-compose down -v
docker-compose up -d

# Check if tables were created
docker-compose exec postgres psql -U search_poc -d payload_cms -c "\dt"
```

### Volume mount not working

**Cause:** Permissions or path issues

**Solution:**
```bash
# Check volume mounts
docker-compose -f docker-compose.dev.yml exec payload ls -la /app/src

# Rebuild with proper volume setup
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## Next Steps

### 1. Sync Property Data

The `SeedPayloadCommand` should now work with the fixed API:

```bash
docker-compose -f ../search-poc/docker-compose.yml exec php \
  bin/console app:seed-payload --limit=100
```

### 2. Test Search Integration

```php
// In search-poc controllers
$properties = $this->payloadService->getProperties(100);

foreach ($properties as $property) {
    // Index in search system
    $this->searchIndex->add([
        'property_id' => $property['id'],
        'name' => $property['name'],
        'region' => $property['region']['name'] ?? null,
        // ... etc
    ]);
}
```

### 3. Implement Real-time Sync (Future)

Add webhooks to Payload to notify search-poc when properties change:

```typescript
// In src/collections/Properties.ts
hooks: {
  afterChange: [
    async ({ doc, req }) => {
      await fetch('http://php:8000/api/admin/sync-property', {
        method: 'POST',
        body: JSON.stringify({
          property_id: doc.id,
          name: doc.name,
          description: doc.description,
          region: doc.region,
        })
      });
    }
  ]
}
```

---

## Questions?

Refer to:
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [REST API Docs](https://payloadcms.com/docs/rest-api/overview)
- Repository CLAUDE.md for development details
