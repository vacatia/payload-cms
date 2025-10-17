import { getPayload } from 'payload'
import config from '../src/payload.config'
import mysql from 'mysql2/promise'

interface IDMaps {
  destinations: Map<number, string>
  amenities: Map<number, string>
  properties: Map<number, string>
  residences: Map<number, string>
}

async function seed() {
  console.log('🌱 Starting Payload CMS seed from Vacatia database...\n')

  // Connect to Vacatia MySQL
  const vacatiaDb = await mysql.createConnection({
    host: process.env.VACATIA_DB_HOST || 'localhost',
    port: parseInt(process.env.VACATIA_DB_PORT || '3306'),
    user: process.env.VACATIA_DB_USER || 'vacatia',
    password: process.env.VACATIA_DB_PASSWORD || 'vacatia',
    database: 'vacatia',
  })

  console.log('✓ Connected to Vacatia database')

  // Initialize Payload
  const payload = await getPayload({ config })
  console.log('✓ Payload initialized\n')

  try {
    // ID mapping (Vacatia ID → Payload ID)
    const maps: IDMaps = {
      destinations: new Map(),
      amenities: new Map(),
      properties: new Map(),
      residences: new Map(),
    }

    // ===== PHASE 1: Amenities (no dependencies) =====
    console.log('📦 Phase 1: Importing amenities...')
    const [amenityRows] = await vacatiaDb.query<any[]>(`
      SELECT id, name, slug, featured, sequence
      FROM amenity
      WHERE is_filterable_rental = 1
      ORDER BY sequence
      LIMIT 100
    `)

    for (const row of amenityRows) {
      try {
        const amenity = await payload.create({
          collection: 'amenities',
          data: {
            legacy_id: row.id,
            name: row.name,
            slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
            featured: !!row.featured,
            category: 'other', // Default, can be categorized later
          },
        })
        maps.amenities.set(row.id, String(amenity.id))
      } catch (err: any) {
        if (!err.message?.includes('duplicate')) {
          console.warn(`  ⚠ Failed to import amenity ${row.name}:`, err.message)
        }
      }
    }
    console.log(`  ✓ Imported ${maps.amenities.size} amenities\n`)

    // ===== PHASE 2: Destinations =====
    console.log('📦 Phase 2: Importing destinations...')
    const [destRows] = await vacatiaDb.query<any[]>(`
      SELECT
        d.id, d.name, d.slug, d.description, d.radius,
        a.latitude, a.longitude
      FROM destination d
      LEFT JOIN address a ON d.address_id = a.id
      WHERE d.rental_enabled = 1 AND d.is_searchable = 1
      ORDER BY d.name
      LIMIT 50
    `)

    for (const row of destRows) {
      try {
        const dest = await payload.create({
          collection: 'destinations',
          data: {
            legacy_id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            latitude: row.latitude,
            longitude: row.longitude,
            radius_miles: row.radius,
          },
        })
        maps.destinations.set(row.id, String(dest.id))
      } catch (err: any) {
        if (!err.message?.includes('duplicate')) {
          console.warn(`  ⚠ Failed to import destination ${row.name}:`, err.message)
        }
      }
    }
    console.log(`  ✓ Imported ${maps.destinations.size} destinations\n`)

    // ===== PHASE 3: Properties =====
    console.log('📦 Phase 3: Importing properties...')
    const [propRows] = await vacatiaDb.query<any[]>(`
      SELECT
        p.id, p.name, p.slug, p.tagline, p.description,
        p.destination_id, p.star_rating,
        p.rental_enabled, p.rental_lowest_price,
        p.check_in_time, p.check_out_time, p.pets_allowed,
        a.address_line1, a.city, s.name as state, s.code as state_code,
        a.postal_code, a.latitude, a.longitude
      FROM property p
      LEFT JOIN address a ON p.address_id = a.id
      LEFT JOIN state s ON a.state_id = s.id
      WHERE p.rental_enabled = 1
      ORDER BY p.name
      LIMIT 200
    `)

    for (const row of propRows) {
      try {
        const property = await payload.create({
          collection: 'properties',
          data: {
            legacy_id: row.id,
            name: row.name,
            slug: row.slug,
            tagline: row.tagline,
            description: row.description,
            star_rating: row.star_rating,

            destination: maps.destinations.get(row.destination_id) || undefined,

            location: {
              address: row.address_line1,
              city: row.city,
              state: row.state || row.state_code,
              postal_code: row.postal_code,
              latitude: row.latitude,
              longitude: row.longitude,
            },

            rental: {
              enabled: !!row.rental_enabled,
              lowest_price: row.rental_lowest_price,
              check_in_time: row.check_in_time,
              check_out_time: row.check_out_time,
              pets_allowed: !!row.pets_allowed,
            },
          },
        })
        maps.properties.set(row.id, String(property.id))
      } catch (err: any) {
        if (!err.message?.includes('duplicate')) {
          console.warn(`  ⚠ Failed to import property ${row.name}:`, err.message)
        }
      }
    }
    console.log(`  ✓ Imported ${maps.properties.size} properties\n`)

    // ===== PHASE 4: Property-Amenity Relationships =====
    console.log('📦 Phase 4: Linking property amenities...')
    const [propAmenities] = await vacatiaDb.query<any[]>(`
      SELECT DISTINCT pa.property_id, pa.amenity_id
      FROM property_amenity pa
      WHERE pa.property_id IN (
        SELECT id FROM property WHERE rental_enabled = 1 LIMIT 200
      )
      ORDER BY pa.property_id
      LIMIT 1000
    `)

    // Group by property
    const amenitiesByProperty = new Map<number, number[]>()
    for (const row of propAmenities) {
      if (!amenitiesByProperty.has(row.property_id)) {
        amenitiesByProperty.set(row.property_id, [])
      }
      amenitiesByProperty.get(row.property_id)!.push(row.amenity_id)
    }

    let linked = 0
    for (const [vacatiaPropId, vacatiaAmenityIds] of amenitiesByProperty.entries()) {
      const payloadPropId = maps.properties.get(vacatiaPropId)
      if (!payloadPropId) continue

      const payloadAmenityIds = vacatiaAmenityIds
        .map(id => maps.amenities.get(id))
        .filter(Boolean) as string[]

      if (payloadAmenityIds.length > 0) {
        try {
          await payload.update({
            collection: 'properties',
            id: payloadPropId,
            data: {
              amenities: payloadAmenityIds,
            },
          })
          linked++
        } catch (err: any) {
          console.warn(`  ⚠ Failed to link amenities for property ${vacatiaPropId}`)
        }
      }
    }
    console.log(`  ✓ Linked amenities for ${linked} properties\n`)

    // ===== PHASE 5: Residences =====
    console.log('📦 Phase 5: Importing residences/units...')
    const [residenceRows] = await vacatiaDb.query<any[]>(`
      SELECT
        pr.id, pr.property_id, pr.name, pr.slug, pr.description,
        pr.number_of_bedrooms, pr.number_of_bathrooms, pr.sleep_quantity,
        pr.square_footage, kt.name as kitchen_type
      FROM property_residence pr
      LEFT JOIN kitchen_type kt ON pr.kitchen_type_id = kt.id
      WHERE pr.for_rental = 1
        AND pr.property_id IN (
          SELECT id FROM property WHERE rental_enabled = 1 LIMIT 200
        )
      ORDER BY pr.property_id, pr.name
      LIMIT 500
    `)

    for (const row of residenceRows) {
      const payloadPropId = maps.properties.get(row.property_id)
      if (!payloadPropId) continue

      try {
        let kitchenType: 'full' | 'kitchenette' | 'none' | undefined
        if (row.kitchen_type?.toLowerCase().includes('full')) {
          kitchenType = 'full'
        } else if (row.kitchen_type?.toLowerCase().includes('kitchenette')) {
          kitchenType = 'kitchenette'
        } else if (row.kitchen_type) {
          kitchenType = 'none'
        }

        const residence = await payload.create({
          collection: 'residences',
          data: {
            legacy_id: row.id,
            property: payloadPropId,
            name: row.name,
            slug: row.slug,
            description: row.description,
            bedrooms: row.number_of_bedrooms,
            bathrooms: row.number_of_bathrooms,
            max_occupancy: row.sleep_quantity,
            square_footage: row.square_footage,
            kitchen_type: kitchenType,
            for_rental: true,
          },
        })
        maps.residences.set(row.id, String(residence.id))
      } catch (err: any) {
        if (!err.message?.includes('duplicate')) {
          console.warn(`  ⚠ Failed to import residence ${row.name}:`, err.message)
        }
      }
    }
    console.log(`  ✓ Imported ${maps.residences.size} residences\n`)

    // ===== Summary =====
    console.log('✅ Seed completed successfully!')
    console.log('\nSummary:')
    console.log(`  Amenities:    ${maps.amenities.size}`)
    console.log(`  Destinations: ${maps.destinations.size}`)
    console.log(`  Properties:   ${maps.properties.size}`)
    console.log(`  Residences:   ${maps.residences.size}`)
    console.log('\nYou can now access the admin UI at: http://localhost:4001/admin')

  } catch (err) {
    console.error('\n❌ Seed failed:', err)
    throw err
  } finally {
    await vacatiaDb.end()
  }
}

// Run seed
seed()
  .then(() => {
    console.log('\n✓ Seed script completed')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
