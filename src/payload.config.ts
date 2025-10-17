import { buildConfig } from 'payload'
import path from 'path'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import Users from './collections/Users'
import Destinations from './collections/Destinations'
import Properties from './collections/Properties'
import Amenities from './collections/Amenities'
import Residences from './collections/Residences'
import Media from './collections/Media'

const databaseUri = process.env.DATABASE_URI || 'postgresql://search_poc:search_poc_pass@postgres:5432/payload_cms'

export default buildConfig({
  admin: {
    user: 'users',
  },
  collections: [
    Users,
    Destinations,
    Properties,
    Amenities,
    Residences,
    Media,
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
