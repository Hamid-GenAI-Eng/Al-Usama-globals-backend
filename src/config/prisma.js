require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is not defined in environment variables.');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});

module.exports = prisma;
