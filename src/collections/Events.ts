import { CollectionConfig } from 'payload/types'

const Events: CollectionConfig = {
  slug: 'events',
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
        { label: 'Concert', value: 'concert' },
        { label: 'Sports', value: 'sports' },
        { label: 'Conference', value: 'conference' },
        { label: 'Festival', value: 'festival' },
        { label: 'Expo', value: 'expo' },
        { label: 'Other', value: 'other' },
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
      name: 'venue_name',
      type: 'text',
      required: true,
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
      name: 'event_date',
      type: 'date',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
    },
  ],
}

export default Events
