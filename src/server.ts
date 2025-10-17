import express, { Request, Response, NextFunction } from 'express'
import { parse } from 'url'
import next from 'next'
import 'dotenv/config'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  try {
    // Import Payload after Next.js is ready
    const { getPayload } = await import('payload')
    const configModule = await import('./payload.config')

    const payload = await getPayload({ config: configModule.default })

    // The push: true in postgresAdapter should handle schema creation
    // Just log what we have
    console.log('✓ Payload initialized with database')

    const app = express()

    // Middleware
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' })
    })

    // API health endpoint (for Docker healthcheck)
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok' })
    })

    // Payload REST API routes
    // Collections
    app.get('/api/:collection', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { collection } = req.params
        const where = req.query.where ? JSON.parse(req.query.where as string) : {}

        // Extract pagination and filtering parameters from query string
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
        const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined
        const sort = (req.query.sort as string) || undefined
        const depth = req.query.depth ? parseInt(req.query.depth as string, 10) : undefined

        const result = await payload.find({
          collection,
          where,
          limit,
          page,
          sort,
          depth,
        })
        res.json(result)
      } catch (err) {
        next(err)
      }
    })

    app.post('/api/:collection', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { collection } = req.params
        const result = await payload.create({ collection, data: req.body })
        res.status(201).json(result)
      } catch (err) {
        next(err)
      }
    })

    app.get('/api/:collection/:id', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { collection, id } = req.params
        const result = await payload.findByID({ collection, id })
        res.json(result)
      } catch (err) {
        next(err)
      }
    })

    app.patch('/api/:collection/:id', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { collection, id } = req.params
        const result = await payload.update({ collection, id, data: req.body })
        res.json(result)
      } catch (err) {
        next(err)
      }
    })

    app.delete('/api/:collection/:id', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { collection, id } = req.params
        await payload.delete({ collection, id })
        res.status(204).send()
      } catch (err) {
        next(err)
      }
    })

    // Handle all other requests through Next.js
    app.all('*', (req, res) => {
      const parsedUrl = parse(req.url!, true)
      handle(req, res, parsedUrl)
    })

    app.listen(port, () => {
      console.log(`✓ Payload CMS server listening on port ${port}`)
      console.log(`✓ Admin UI: http://localhost:${port}/admin`)
      console.log(`✓ API: http://localhost:${port}/api`)
      console.log(`✓ Health: http://localhost:${port}/health`)
    })

    // Handle graceful shutdown
    const gracefulShutdown = () => {
      console.log('Shutting down gracefully...')
      process.exit(0)
    }

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)
  } catch (err) {
    console.error('Failed to start Payload CMS:', err)
    process.exit(1)
  }
})
