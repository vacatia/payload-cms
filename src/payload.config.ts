import { buildConfig } from 'payload'
import path from 'path'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import Users from './collections/Users'
import Regions from './collections/Regions'
import Properties from './collections/Properties'
import Amenities from './collections/Amenities'
import POIs from './collections/POIs'
import Events from './collections/Events'
import ProviderMappings from './collections/ProviderMappings'

const databaseUri = process.env.DATABASE_URI || 'postgresql://search_poc:search_poc_pass@postgres:5432/payload_cms'

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    Users,
    Regions,
    Properties,
    Amenities,
    POIs,
    Events,
    ProviderMappings,
  ],
  cors: [
    'http://localhost:4001',
    'http://localhost:8001',
    'http://localhost:3000',
  ],
  csrf: [
    'http://localhost:4001',
    'http://localhost:8001',
    'http://localhost:3000',
  ],
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
    push: true, // Auto-create/update database schema
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-this-in-production',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
})
