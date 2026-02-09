/** @type {import('next').NextConfig} */
const nextConfig = {
    // Mark better-sqlite3 as external package for server
    serverExternalPackages: ['better-sqlite3']
}

module.exports = nextConfig
