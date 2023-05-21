import express from 'express'
import pino from 'pino'
import { repositories } from '../db'
import { parseTransaction } from 'ethers/lib/utils'
import { supportedProviders } from '../utils'

const sixMonthsInSeconds = 86400 * 180

export function startServer(logger: pino.Logger): void {
  logger.info('Starting up the server')
  const port = Number(process.env.PORT || 8080)
  const app = setupServer(logger)
  app.listen(port, () => {
    logger.info(`Server has started and is running on port ${port}`)
  })
}

function validateTransaction(logger: pino.Logger, transaction: unknown): string | undefined {
  if (!transaction || typeof transaction !== 'string') {
    logger.error(`Invalid transaction value specified: ${transaction}`)
    return 'The transaction value must be a signed transaction string'
  }

  try {
    const tx = parseTransaction(transaction)
    if (!tx.hash) {
      logger.error({ transaction, msg: `Failed to read transaction hash: ${transaction}` })
      return `Failed to read transaction hash`
    }

    if (!supportedProviders[tx.chainId]) {
      logger.error({ transaction, msg: `Unsupported chain: ${tx.chainId}` })
      return `Unsupported chain: ${tx.chainId}`
    }

    if (!tx.v && !tx.r && !tx.s) {
      logger.error({ transaction, msg: `Unsupported chain: ${tx.chainId}` })
      return `Unsigned transaction`
    }
  } catch (err) {
    logger.error({ transaction, err, msg: `Invalid transaction value specified: ${transaction}` })
    return 'The transaction value must be a signed transaction string'
  }
}

function validateTime(logger: pino.Logger, transaction: string, time: unknown): string | undefined {
  if (!time || typeof time !== 'number' || isNaN(time)) {
    logger.error({
      transaction,
      msg: `Invalid time value supplied: ${time}. Reason: not specified or not a number.`,
    })
    return "The 'time' field is required and must be specified as a unix timestamp in seconds"
  }

  const now = Date.now() / 1000
  if (time - now > sixMonthsInSeconds) {
    logger.error({
      transaction,
      msg: `Invalid time value supplied: ${time}. Reason: Too far in the future.`,
    })
    return "The value of the 'time' field cannot be more than 6 months in the future and must be specified in seconds."
  }
}

function setupServer(logger: pino.Logger) {
  const app = express()
  app.use(express.json())

  app.post('/schedule', (req, res) => {
    const { transaction, time } = req.body

    const transactionErrorMessage = validateTransaction(logger, transaction)
    if (transactionErrorMessage) {
      res.status(400).json({
        status: 'failed',
        message: transactionErrorMessage,
      })
      return
    }

    const timeErrorMessage = validateTime(logger, transaction, time)
    if (timeErrorMessage) {
      res.status(400).json({
        status: 'failed',
        message: timeErrorMessage,
      })
      return
    }

    repositories.transactions
      .storeTransactionSchedule({ transaction, time })
      .then(() => {
        res.status(201).json({
          status: 'pending',
          message: 'The transaction has been scheduled successfully',
        })
      })
      .catch((err) => {
        logger.error({ transaction, err, msg: 'Failed to submit schedule' })
        res.status(500).json({
          status: 'failed',
          message: 'Failed to submit schedule. An internal error occurred',
        })
      })
  })
  return app
}
