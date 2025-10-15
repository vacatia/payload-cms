import { CollectionConfig } from 'payload/types'

const POIs: CollectionConfig = {
  slug: 'pois',
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Golf', value: 'golf' },
        { label: 'Beach', value: 'beach' },
        { label: 'Medical', value: 'medical' },
        { label: 'Theme Park', value: 'theme-park' },
        { label: 'Spa', value: 'spa' },
        { label: 'Convention Center', value: 'convention-center' },
        { label: 'Shopping', value: 'shopping' },
        { label: 'Dining', value: 'dining' },
        { label: 'Entertainment', value: 'entertainment' },
      ],
      required: false,
    },
    {
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
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
      name: 'description',
      type: 'richText',
      required: false,
    },
  ],
}

export default POIs
