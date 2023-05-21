import { parseTransaction } from 'ethers/lib/utils'
import pino from 'pino'
import { TransactionSchedule } from '../dto'
import { confirmationsToDone, pendingTransactions, supportedProviders } from '../utils'
import { providers } from 'ethers'

const processingTransactions = new Map<
  number,
  TransactionSchedule & { processingStarted: number }
>()

export async function monitorPendingTransactions(
  logger: pino.Logger,
  cleanup: (id: number) => Promise<void>
) {
  logger.info('Launching schedule executor')
  while (true) {
    while (pendingTransactions.size > 0) {
      for (const id of [...pendingTransactions.keys()]) {
        logger.info(`New schedule found: ${id}`)
        const schedule = pendingTransactions.get(id)!
        pendingTransactions.delete(id)
        processingTransactions.set(id, { ...schedule, processingStarted: Date.now() })
        processSchedule(logger, schedule, cleanup)
          .then(() => logger.info(`Submitted transaction: ${id}`))
          .catch((err) => logger.error({ err, msg: `Failed to submit transaction '${id}'.` }))
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
}

async function processSchedule(
  logger: pino.Logger,
  schedule: TransactionSchedule,
  cleanup: (id: number) => Promise<void>
) {
  try {
    logger.info(`Processing schedule: ${schedule.id}`)
    const tx = parseTransaction(schedule.transaction)
    const chainId = tx.chainId
    const provider = supportedProviders[chainId]
    if (!provider) {
      throw Error(`Chain not supported: ${chainId}`)
    }

    if (tx.hash) {
      try {
        const txFromProvider = await provider.getTransaction(tx.hash)
        logger.info({
          transaction: tx.hash,
          msg: `Transaction already submitted: '${tx.hash}'. Waiting for confirmation.`,
        })
        if (txFromProvider.confirmations < confirmationsToDone) {
          await txFromProvider.wait(confirmationsToDone)
        }
        return
      } catch {}
    }

    await submitTransaction(logger, provider, schedule)
  } finally {
    processingTransactions.delete(schedule.id)
    await cleanup(schedule.id)
  }
}

async function submitTransaction(
  logger: pino.Logger,
  provider: providers.JsonRpcProvider,
  schedule: TransactionSchedule
) {
  logger.info(`Submitting transaction for schedule: ${schedule.id}`)
  const txResponse = await provider.sendTransaction(schedule.transaction)
  if (confirmationsToDone) {
    await txResponse.wait(confirmationsToDone)
  }
}
