import type { CollectionConfig } from 'payload'

const Properties: CollectionConfig = {
  slug: 'properties',
  defaultLimit: 100,
  admin: {
    useAsTitle: 'name',
    pagination: {
      defaultLimit: 100,
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
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
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      required: false,
    },
    {
      name: 'address',
      type: 'text',
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
      name: 'star_rating',
      type: 'number',
      required: false,
      min: 1,
      max: 5,
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
    },
  ],
}

export default Properties
