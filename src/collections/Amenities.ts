import type { CollectionConfig } from 'payload'

const Amenities: CollectionConfig = {
  slug: 'amenities',
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
      unique: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Free WiFi', value: 'freeWifi' },
        { label: 'Free Parking', value: 'freeParking' },
        { label: 'Free Breakfast', value: 'freeBreakfast' },
        { label: 'Pool', value: 'pool' },
        { label: 'Spa', value: 'spa' },
        { label: 'Fitness Center', value: 'fitnessCenter' },
        { label: 'Golf', value: 'golf' },
        { label: 'Casino', value: 'casino' },
        { label: 'Beach', value: 'beach' },
        { label: 'Restaurant', value: 'restaurant' },
      ],
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
  ],
}

export default Amenities
