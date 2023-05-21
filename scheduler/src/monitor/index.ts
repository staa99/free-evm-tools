import pino from 'pino'
import { repositories } from '../db'
import { pendingTransactions } from '../utils'

let lastLoadedTime = 0
export async function monitorTransactionSchedules(logger: pino.Logger) {
  logger.info('Launching schedule db monitor')
  while (true) {
    try {
      const now = Date.now()
      const schedules = await repositories.transactions.loadTransactionsForTime(lastLoadedTime, now)
      lastLoadedTime = now

      for (const schedule of schedules) {
        pendingTransactions.set(schedule.id, schedule)
      }

      await new Promise((resolve) => setTimeout(resolve, 2500))
    } catch (e) {
      console.error(e)
    }
  }
}
