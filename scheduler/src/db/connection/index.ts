import { Pool } from 'pg'

let pool: Pool | undefined

export async function getPool(): Promise<Pool> {
  if (pool) {
    return pool
  }

  console.log('Connecting to the database...')
  pool = new Pool({
    connectionString: process.env.PG_CONNSTRING,
  })
  await pool.connect()
  console.log('Connected to the database.')
  return pool
}
