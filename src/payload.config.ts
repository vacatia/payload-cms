import { buildConfig } from 'payload/config'
import path from 'path'
import PostgresAdapter from '@payloadcms/db-postgres'
import { slateEditor } from '@payloadcms/richtext-slate'

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
  db: new PostgresAdapter({
    url: databaseUri,
  }),
  editor: slateEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-this-in-production',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
})
