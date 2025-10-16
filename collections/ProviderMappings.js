"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProviderMappings = {
    slug: 'provider-mappings',
    admin: {
        useAsTitle: 'provider_property_id',
    },
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    fields: [
        {
            name: 'property',
            type: 'relationship',
            relationTo: 'properties',
            required: true,
        },
        {
            name: 'provider_name',
            type: 'select',
            options: [
                { label: 'Expedia', value: 'expedia' },
                { label: 'HotelBeds', value: 'hotelbeds' },
                { label: 'Provider A', value: 'provider_a' },
                { label: 'Provider B', value: 'provider_b' },
            ],
            required: true,
        },
        {
            name: 'provider_property_id',
            type: 'text',
            required: true,
        },
    ],
};
exports.default = ProviderMappings;
