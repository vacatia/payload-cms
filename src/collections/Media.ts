import type { CollectionConfig } from 'payload'

const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: './media',
    mimeTypes: ['image/*', 'video/*'],
  },
  admin: {
    useAsTitle: 'alt',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'legacy_id',
      type: 'number',
      admin: {
        description: 'Original media ID from Vacatia database',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'caption',
      type: 'text',
      required: false,
    },
  ],
}

export default Media
