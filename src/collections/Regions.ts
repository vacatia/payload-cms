import type { CollectionConfig } from 'payload'

const Regions: CollectionConfig = {
  slug: 'regions',
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
      unique: false,
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
  ],
}

export default Regions
