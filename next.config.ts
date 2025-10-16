import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't automatically enable Payload routes - we'll handle them manually
}

export default withPayload(nextConfig)
