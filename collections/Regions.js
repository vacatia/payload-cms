"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Regions = {
    slug: 'regions',
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
};
exports.default = Regions;
