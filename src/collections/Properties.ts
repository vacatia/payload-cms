import type { CollectionConfig } from 'payload'

const Properties: CollectionConfig = {
  slug: 'properties',
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
      name: 'tagline',
      type: 'text',
      required: false,
      admin: {
        description: 'Marketing tagline',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: false,
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'address',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'postal_code',
          type: 'text',
        },
        {
          name: 'latitude',
          type: 'number',
        },
        {
          name: 'longitude',
          type: 'number',
        },
      ],
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      required: false,
    },
    {
      name: 'amenities',
      type: 'relationship',
      relationTo: 'amenities',
      hasMany: true,
      required: false,
    },
    {
      name: 'star_rating',
      type: 'number',
      required: false,
      min: 0,
      max: 5,
    },
    {
      name: 'rental',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'lowest_price',
          type: 'number',
          required: false,
        },
        {
          name: 'check_in_time',
          type: 'text',
          required: false,
        },
        {
          name: 'check_out_time',
          type: 'text',
          required: false,
        },
        {
          name: 'pets_allowed',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}

export default Properties
