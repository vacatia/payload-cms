import express from 'express'
import payload from 'payload'
import 'dotenv/config'

const app = express()
const PORT = parseInt(process.env.PORT || '3000', 10)

const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload CMS initialized`)
    },
  })

  app.listen(PORT, () => {
    payload.logger.info(`Payload CMS is running at http://localhost:${PORT}`)
  })
}

start()
