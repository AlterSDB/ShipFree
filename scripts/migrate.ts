import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import mysql from 'mysql2/promise'
import process from 'node:process'

config()

const isProd = process.env.NODE_ENV === 'production'
const connectionString = isProd ? process.env.PROD_DATABASE_URL : process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(`${isProd ? 'PROD_DATABASE_URL' : 'DATABASE_URL'} is not set`)
}

console.log('Connecting to:', connectionString.replace(/:[^:@]+@/, ':****@'))

async function main() {
  console.log('Running migrations....')

  let connection
  try {
    connection = await mysql.createConnection(connectionString!)
    const db = drizzle(connection)
    await migrate(db, { migrationsFolder: './migrations' })
    console.log('Migrations completed!')
  } catch (error) {
    console.error('Migrations failed:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})