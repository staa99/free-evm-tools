import { TransactionSchedule } from '../../dto'
import { getPool } from '../connection'
import { queries } from './queries'

export async function storeTransactionSchedule(schedule: { transaction: string; time: number }) {
  const pool = await getPool()
  await pool.query({
    text: queries.insertTransaction,
    values: [schedule.transaction, schedule.time],
  })
}

export async function loadTransactionsForTime(
  start: number,
  end: number
): Promise<TransactionSchedule[]> {
  const pool = await getPool()
  const result = await pool.query({
    text: queries.getTransactionsByTime,
    values: [start, end],
  })
  return result.rows.map((row) => ({ id: row.id, transaction: row.tx, time: row.time }))
}

export async function deleteTransaction(id: number) {
  const pool = await getPool()
  await pool.query({
    text: queries.deleteTransaction,
    values: [id],
  })
}
