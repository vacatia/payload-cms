"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url_1 = require("url");
const next_1 = __importDefault(require("next"));
require("dotenv/config");
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = (0, next_1.default)({ dev });
const handle = nextApp.getRequestHandler();
nextApp.prepare().then(async () => {
    try {
        // Import Payload after Next.js is ready
        const { getPayload } = await Promise.resolve().then(() => __importStar(require('payload')));
        const configModule = await Promise.resolve().then(() => __importStar(require('./payload.config')));
        const payload = await getPayload({ config: configModule.default });
        // The push: true in postgresAdapter should handle schema creation
        // Just log what we have
        console.log('✓ Payload initialized with database');
        const app = (0, express_1.default)();
        // Middleware
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({ status: 'ok' });
        });
        // Payload REST API routes
        // Collections
        app.get('/api/:collection', async (req, res, next) => {
            try {
                const { collection } = req.params;
                const where = req.query.where ? JSON.parse(req.query.where) : {};
                const result = await payload.find({ collection, where });
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        });
        app.post('/api/:collection', async (req, res, next) => {
            try {
                const { collection } = req.params;
                const result = await payload.create({ collection, data: req.body });
                res.status(201).json(result);
            }
            catch (err) {
                next(err);
            }
        });
        app.get('/api/:collection/:id', async (req, res, next) => {
            try {
                const { collection, id } = req.params;
                const result = await payload.findByID({ collection, id });
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        });
        app.patch('/api/:collection/:id', async (req, res, next) => {
            try {
                const { collection, id } = req.params;
                const result = await payload.update({ collection, id, data: req.body });
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        });
        app.delete('/api/:collection/:id', async (req, res, next) => {
            try {
                const { collection, id } = req.params;
                await payload.delete({ collection, id });
                res.status(204).send();
            }
            catch (err) {
                next(err);
            }
        });
        // Handle all other requests through Next.js
        app.all('*', (req, res) => {
            const parsedUrl = (0, url_1.parse)(req.url, true);
            handle(req, res, parsedUrl);
        });
        app.listen(port, () => {
            console.log(`✓ Payload CMS server listening on port ${port}`);
            console.log(`✓ Admin UI: http://localhost:${port}/admin`);
            console.log(`✓ API: http://localhost:${port}/api`);
            console.log(`✓ Health: http://localhost:${port}/health`);
        });
        // Handle graceful shutdown
        const gracefulShutdown = () => {
            console.log('Shutting down gracefully...');
            process.exit(0);
        };
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }
    catch (err) {
        console.error('Failed to start Payload CMS:', err);
        process.exit(1);
    }
});
