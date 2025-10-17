import type { CollectionConfig } from 'payload'

const Residences: CollectionConfig = {
  slug: 'residences',
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
      unique: true,
      admin: {
        description: 'Original ID from Vacatia database',
      },
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
    },
    {
      name: 'bedrooms',
      type: 'number',
      required: false,
    },
    {
      name: 'bathrooms',
      type: 'number',
      required: false,
    },
    {
      name: 'max_occupancy',
      type: 'number',
      required: false,
      admin: {
        description: 'Maximum number of guests',
      },
    },
    {
      name: 'square_footage',
      type: 'text',
      required: false,
    },
    {
      name: 'kitchen_type',
      type: 'select',
      options: [
        { label: 'Full Kitchen', value: 'full' },
        { label: 'Kitchenette', value: 'kitchenette' },
        { label: 'No Kitchen', value: 'none' },
      ],
    },
    {
      name: 'amenities',
      type: 'relationship',
      relationTo: 'amenities',
      hasMany: true,
      required: false,
      admin: {
        description: 'Amenities specific to this residence/unit',
      },
    },
    {
      name: 'for_rental',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}

export default Residences
