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
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Pool & Spa', value: 'pool' },
        { label: 'Kitchen & Dining', value: 'kitchen' },
        { label: 'WiFi & Tech', value: 'wifi' },
        { label: 'Parking', value: 'parking' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Fitness & Sports', value: 'fitness' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show as featured amenity',
      },
    },
  ],
}

export default Amenities
