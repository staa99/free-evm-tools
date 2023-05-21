import { TransactionSchedule } from '../dto'
import { providers } from 'ethers'

export const pendingTransactions = new Map<number, TransactionSchedule>()
export const supportedProviders: Record<number, providers.JsonRpcProvider> = {
  1: new providers.JsonRpcProvider(process.env.ETH_PROVIDER),
  56: new providers.JsonRpcProvider(process.env.BSC_PROVIDER),
  137: new providers.JsonRpcProvider(process.env.POLYGON_PROVIDER),
}
export const confirmationsToDone = Number(process.env.CONFIRMATIONS_TO_DONE || 5)
