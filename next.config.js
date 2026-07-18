/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for static site generation (commented out for dev)
  // output: 'export',
  // trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  // Remove server-side environment variables
}

module.exports = nextConfig