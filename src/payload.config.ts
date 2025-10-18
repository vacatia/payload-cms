import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import Users from './collections/Users.js'
import Destinations from './collections/Destinations.js'
import Properties from './collections/Properties.js'
import Amenities from './collections/Amenities.js'
import Residences from './collections/Residences.js'
import Media from './collections/Media.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Destinations, Properties, Amenities, Residences, Media],
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
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-this-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
})
