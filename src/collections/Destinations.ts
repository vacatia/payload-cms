import type { CollectionConfig } from 'payload'

const Destinations: CollectionConfig = {
  slug: 'destinations',
  admin: {
    useAsTitle: 'name',
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
        description: 'Original ID from Vacatia database',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
    },
    {
      name: 'latitude',
      type: 'number',
      required: false,
    },
    {
      name: 'longitude',
      type: 'number',
      required: false,
    },
    {
      name: 'radius_miles',
      type: 'number',
      required: false,
      admin: {
        description: 'Radius around destination center point',
      },
    },
  ],
}

export default Destinations
