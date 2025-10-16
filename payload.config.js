"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payload_1 = require("payload");
const path_1 = __importDefault(require("path"));
const db_postgres_1 = require("@payloadcms/db-postgres");
const richtext_lexical_1 = require("@payloadcms/richtext-lexical");
const Users_1 = __importDefault(require("./collections/Users"));
const Regions_1 = __importDefault(require("./collections/Regions"));
const Properties_1 = __importDefault(require("./collections/Properties"));
const Amenities_1 = __importDefault(require("./collections/Amenities"));
const POIs_1 = __importDefault(require("./collections/POIs"));
const Events_1 = __importDefault(require("./collections/Events"));
const ProviderMappings_1 = __importDefault(require("./collections/ProviderMappings"));
const databaseUri = process.env.DATABASE_URI || 'postgresql://search_poc:search_poc_pass@postgres:5432/payload_cms';
exports.default = (0, payload_1.buildConfig)({
    admin: {
        user: 'users',
    },
    collections: [
        Users_1.default,
        Regions_1.default,
        Properties_1.default,
        Amenities_1.default,
        POIs_1.default,
        Events_1.default,
        ProviderMappings_1.default,
    ],
    cors: [
        'http://localhost:4001',
        'http://localhost:8001',
        'http://localhost:3000',
    ],
    csrf: [
        'http://localhost:4001',
        'http://localhost:8001',
        'http://localhost:3000',
    ],
    db: (0, db_postgres_1.postgresAdapter)({
        pool: {
            connectionString: databaseUri,
        },
        push: true, // Auto-create/update database schema
    }),
    editor: (0, richtext_lexical_1.lexicalEditor)(),
    secret: process.env.PAYLOAD_SECRET || 'your-secret-key-change-this-in-production',
    typescript: {
        outputFile: path_1.default.resolve(__dirname, 'payload-types.ts'),
    },
});
