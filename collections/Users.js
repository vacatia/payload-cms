"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Users = {
    slug: 'users',
    admin: {
        useAsTitle: 'email',
    },
    auth: true,
    access: {
        read: () => true,
        create: () => true,
        update: () => true,
        delete: () => true,
    },
    fields: [
        {
            name: 'email',
            type: 'email',
            required: true,
            unique: true,
        },
        {
            name: 'name',
            type: 'text',
            required: false,
        },
    ],
};
exports.default = Users;
