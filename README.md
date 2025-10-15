# Vacatia Payload CMS

A production-ready Payload CMS instance that manages property data for the Vacatia project.

## Overview

This is a standalone Payload CMS repository that provides a headless CMS for managing:
- **Properties**: Holiday rental properties with ratings and descriptions
- **Regions**: Geographic regions where properties are located
- **Amenities**: Services and facilities available at properties
- **Points of Interest (POIs)**: Tourist attractions and services near properties
- **Events**: Local events happening in regions
- **Provider Mappings**: Integration mappings for external providers (Expedia, HotelBeds, etc.)

## Collections

### Regions
Geographic regions for organizing properties.
- **Fields**: name, slug (unique), description (rich text)

### Properties
Holiday rental properties with location and details.
- **Fields**: name, slug (unique), region (relationship), address, latitude, longitude, star_rating (1-5), description (rich text)

### Amenities
Services and facilities offered.
- **Fields**: name (unique), type (select), description

### POIs (Points of Interest)
Tourist attractions and nearby services.
- **Fields**: name, type (select), region (relationship), latitude, longitude, description (rich text)

### Events
Local events happening in regions.
- **Fields**: name, type (select), region (relationship), venue_name, latitude, longitude, event_date (required), description (rich text)

### Provider Mappings
Mappings between properties and external provider IDs.
- **Fields**: property (relationship, required), provider_name (select, required), provider_property_id (text, required)

## Setup Instructions

### Prerequisites
- Node.js 20+ or Docker
- PostgreSQL 16+ (or use Docker)
- npm or yarn

### Local Development

1. **Clone the repository:**
```bash
cd ~/vacatia/payload-cms
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.local .env.local  # Already configured for docker-compose
```

4. **Start PostgreSQL (Docker):**
```bash
docker run --name payload-postgres -e POSTGRES_USER=search_poc -e POSTGRES_PASSWORD=search_poc_pass -e POSTGRES_DB=payload_cms -p 5432:5432 -d postgis/postgis:16-3.4
```

5. **Start Payload CMS:**
```bash
npm run dev
```

The admin interface will be available at `http://localhost:3000/admin`

### Docker Setup (Recommended)

**Start everything with Docker Compose:**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (postgres:5432)
- Payload CMS (http://localhost:4001)

**Verify it's running:**
```bash
docker-compose logs -f payload
```

**Stop the services:**
```bash
docker-compose down
```

**Stop and remove data:**
```bash
docker-compose down -v
```

## Admin Access

- **URL**: http://localhost:4001 (docker-compose) or http://localhost:3000 (dev)
- **Email**: admin@payloadcms.com
- **Password**: admin123

## Environment Variables

```
DATABASE_URI=postgresql://search_poc:search_poc_pass@postgres:5432/payload_cms
PAYLOAD_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
PORT=3000
```

**Important**: Change `PAYLOAD_SECRET` in production!

## API Endpoints

All endpoints are prefixed with `/api/`

### Collections
- `GET /api/regions` - List all regions
- `POST /api/regions` - Create a region
- `GET /api/regions/{id}` - Get a region
- `PATCH /api/regions/{id}` - Update a region
- `DELETE /api/regions/{id}` - Delete a region

Same pattern applies to:
- `/api/properties`
- `/api/amenities`
- `/api/pois`
- `/api/events`
- `/api/provider-mappings`

### Authentication

POST to `/api/users/login` with:
```json
{
  "email": "admin@payloadcms.com",
  "password": "admin123"
}
```

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build TypeScript
npm start        # Start production server
npm run payload  # Payload CLI commands
```

## Production Deployment

1. **Build the Docker image:**
```bash
docker build -t vacatia/payload-cms:latest .
```

2. **Push to registry:**
```bash
docker push vacatia/payload-cms:latest
```

3. **Update docker-compose in search-poc:**
```yaml
services:
  payload:
    image: vacatia/payload-cms:latest
    ports:
      - "4001:3000"
    environment:
      DATABASE_URI: postgresql://...
      PAYLOAD_SECRET: your-secure-secret
```

## CORS Configuration

The following origins are allowed:
- `http://localhost:4001`
- `http://localhost:8001`
- `http://localhost:3000`

Update `src/payload.config.ts` to add more origins in production.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URI in .env.local
- Ensure database user has correct permissions

### Port Already in Use
- Change PORT in .env.local or docker-compose.yml
- Kill process: `lsof -i :3000` and `kill -9 <PID>`

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear dist: `rm -rf dist`
- Rebuild: `npm run build`

## Integration with search-poc

The search-poc application references this Payload CMS instance through:
- **Docker service**: `payload`
- **Base URL**: `http://payload:3000`
- **Admin URL**: `http://localhost:4001`

Both services should be in the same Docker network (`payload-network`) for proper communication.

## Performance Considerations

- PostgreSQL with PostGIS extension enables geographic queries
- Rich text fields use Slate editor for structured content
- Relationships between collections are fully indexed
- CORS and CSRF protection enabled

## Security Notes

- Change `PAYLOAD_SECRET` in production
- Use strong database passwords
- Enable SSL/TLS for database connections in production
- Restrict CORS origins in production
- Use environment variables for all secrets
- Implement custom access control policies as needed

## License

ISC

## Support

For issues and questions, refer to:
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [GitHub Issues](https://github.com/vacatia/payload-cms/issues)
