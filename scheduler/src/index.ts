import dotenv from 'dotenv'
import pino from 'pino'
import { monitorTransactionSchedules } from './monitor'
import { monitorPendingTransactions } from './executor'
import { repositories } from './db'
import { startServer } from './server'

dotenv.config()
const logger = pino()
async function startMonitors() {
  await Promise.all([
    monitorTransactionSchedules(logger),
    monitorPendingTransactions(logger, repositories.transactions.deleteTransaction),
  ])
}

async function start() {
  startServer(logger)
  await startMonitors()
}

start().catch((e) => {
  console.error(e)
  throw e
})
