import payload from 'payload'
import config from './payload.config'
import 'dotenv/config'

const start = async () => {
  await payload.init({
    config,
    onInit: async () => {
      payload.logger.info(`Payload CMS initialized successfully`)
    },
  })
}

start().catch((err) => {
  payload.logger.error(`Failed to start Payload CMS: ${err}`)
  process.exit(1)
})
