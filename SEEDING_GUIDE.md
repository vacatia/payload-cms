# Payload CMS - Seeding from Vacatia Database

This guide explains how to populate Payload CMS with property data from the Vacatia MySQL database.

## Collections Structure

The Payload CMS is configured with these collections:

| Collection | Description | Source | Records |
|------------|-------------|--------|---------|
| **Users** | Admin authentication | Manual | N/A |
| **Destinations** | Geographic regions (Orlando, Miami, etc.) | Vacatia `destination` table | ~50 |
| **Amenities** | Property features (Pool, WiFi, Parking, etc.) | Vacatia `amenity` table | ~100 |
| **Properties** | Main properties with location, ratings, rental info | Vacatia `property` table | ~200 |
| **Residences** | Individual units/rooms within properties | Vacatia `property_residence` table | ~500 |
| **Media** | Images and videos | Vacatia `media` table | Future |

## Prerequisites

1. **Vacatia database must be accessible**
   - MySQL running on localhost:3306 (or remote)
   - Database name: `vacatia`
   - User credentials available

2. **Payload CMS running**
   - PostgreSQL database initialized
   - Payload server started (or will start during seed)

## Seed Process

### Step 1: Configure Vacatia Database Connection

Create or update `.env.local`:

```bash
# Payload CMS (target)
DATABASE_URI=postgresql://search_poc:search_poc_pass@postgres:5432/payload_cms
PAYLOAD_SECRET=your-secret-key

# Vacatia DB (source)
VACATIA_DB_HOST=localhost
VACATIA_DB_PORT=3306
VACATIA_DB_USER=vacatia
VACATIA_DB_PASSWORD=vacatia
```

### Step 2: Ensure Fresh Payload Database

```bash
# Reset Payload database (removes all existing data!)
docker-compose down -v
docker-compose up -d

# Wait for database to initialize
sleep 15
```

### Step 3: Run the Seed Script

```bash
# Ensure Vacatia database is accessible
# (If running in Docker, make sure network allows access)

# Run seed
npm run seed
```

**Expected output:**
```
🌱 Starting Payload CMS seed from Vacatia database...

✓ Connected to Vacatia database
✓ Payload initialized

📦 Phase 1: Importing amenities...
  ✓ Imported 98 amenities

📦 Phase 2: Importing destinations...
  ✓ Imported 42 destinations

📦 Phase 3: Importing properties...
  ✓ Imported 187 properties

📦 Phase 4: Linking property amenities...
  ✓ Linked amenities for 183 properties

📦 Phase 5: Importing residences/units...
  ✓ Imported 476 residences

✅ Seed completed successfully!

Summary:
  Amenities:    98
  Destinations: 42
  Properties:   187
  Residences:   476

You can now access the admin UI at: http://localhost:4001/admin
```

### Step 4: Verify Import

```bash
# Check collections in admin UI
open http://localhost:4001/admin

# Or via API
curl http://localhost:4001/api/properties?limit=10
curl http://localhost:4001/api/destinations
curl http://localhost:4001/api/amenities
curl http://localhost:4001/api/residences?limit=20
```

## Data Import Details

### Phase 1: Amenities
- Source: `amenity` table
- Filter: `WHERE is_filterable_rental = 1`
- Limit: 100 records
- Maps: Vacatia ID → Payload ID for relationships

### Phase 2: Destinations
- Source: `destination` table + `address` (for coordinates)
- Filter: `WHERE rental_enabled = 1 AND is_searchable = 1`
- Limit: 50 records
- Includes: latitude, longitude, radius

### Phase 3: Properties
- Source: `property` table + joins to `address`, `state`, `destination`
- Filter: `WHERE rental_enabled = 1`
- Limit: 200 records
- Fields imported:
  - Basic: name, slug, tagline, description, star_rating
  - Location: full address, city, state, postal code, coordinates
  - Rental: enabled, lowest_price, check-in/out times, pets_allowed
  - Relationship: destination (linked by ID)

### Phase 4: Property-Amenity Relationships
- Source: `property_amenity` junction table
- Links properties to amenities using ID mappings
- Only links properties and amenities that were successfully imported

### Phase 5: Residences/Units
- Source: `property_residence` table + `kitchen_type`
- Filter: `WHERE for_rental = 1`
- Limit: 500 records
- Fields: bedrooms, bathrooms, max_occupancy, square_footage, kitchen_type
- Automatically linked to parent property

## Troubleshooting

### Error: Cannot connect to Vacatia database

**Solution:**
```bash
# Check if Vacatia database is running
docker ps | grep vacatia

# If running in different network, update docker-compose:
services:
  payload:
    extra_hosts:
      - "host.docker.internal:host-gateway"

# Then use:
VACATIA_DB_HOST=host.docker.internal
```

### Error: Duplicate key violation

This happens if seed is run multiple times. The script handles duplicates gracefully and continues.

**To start fresh:**
```bash
docker-compose down -v
docker-compose up -d
npm run seed
```

### Seed runs but no data appears

**Check:**
1. Payload logs for errors: `docker logs payload-cms`
2. Database connectivity: Vacatia DB must be accessible
3. Data exists in Vacatia: Run queries manually to verify

### Partial import (some phases fail)

The script is idempotent - you can run it multiple times. It will skip duplicates and continue.

## Customizing the Seed

### Import More/Fewer Records

Edit `migrations/seed.ts`:

```typescript
// Line 43-47: Amenities
LIMIT 100  // Change this number

// Line 75-81: Destinations
LIMIT 50   // Change this number

// Line 108-121: Properties
LIMIT 200  // Change this number (affects residences too)

// Line 221-231: Residences
LIMIT 500  // Change this number
```

### Add More Fields

To import additional Vacatia fields:

1. Add field to collection (e.g., `src/collections/Properties.ts`)
2. Update SQL query in `migrations/seed.ts` to SELECT that field
3. Map the field in the `data` object when calling `payload.create()`

Example - adding `year_built`:

```typescript
// 1. Add to Properties.ts
{
  name: 'year_built',
  type: 'number',
}

// 2. Update SQL query (line ~108)
SELECT p.year_built, ...

// 3. Map in data object (line ~126)
data: {
  year_built: row.year_built,
  // ...
}
```

## Next Steps After Seeding

1. **Access admin UI:** http://localhost:4001/admin
2. **View collections:** Browse properties, residences, amenities
3. **Test search-poc integration:** Verify search-poc can query Payload API
4. **Add vector search hooks:** Implement afterChange hooks for embedding generation

## Seeding for Development vs Production

### Development (Subset)
```bash
# Quick seed with limited data
npm run seed  # Uses LIMIT clauses (200 properties, 500 residences)
```

### Production (Full Dataset)
```bash
# Edit migrations/seed.ts - remove or increase LIMIT clauses
# Then run:
npm run seed
```

## Re-seeding

To re-seed with fresh data:

```bash
# 1. Stop containers
docker-compose down -v

# 2. Start fresh
docker-compose up -d
sleep 15

# 3. Re-seed
npm run seed
```

---

**For questions or issues, see CLAUDE.md and SEARCH_POC_INTEGRATION.md**
