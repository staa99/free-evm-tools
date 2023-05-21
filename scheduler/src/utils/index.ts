import { TransactionSchedule } from '../dto'
import { providers } from 'ethers'
import * as process from 'process'

export const pendingTransactions = new Map<number, TransactionSchedule>()
export const confirmationsToDone = Number(process.env.CONFIRMATIONS_TO_DONE || 5)
export const supportedProviders: Record<number, providers.JsonRpcProvider | undefined> = {}

export async function setupProviders() {
  for (const key of Object.keys(process.env)) {
    if (!key.startsWith('EVM_PROVIDER_') || !/EVM_PROVIDER_\d+/.test(key)) {
      continue
    }

    const chainId = Number(key.substring(13))
    const value = process.env[key]!.trim()
    if (!value) {
      continue
    }

    let connectionInfo
    try {
      connectionInfo = JSON.parse(value)
      if (!connectionInfo.url) {
        continue
      }
    } catch {
      connectionInfo = value
    }

    const provider = new providers.JsonRpcProvider(connectionInfo)

    try {
      await provider.getBlockNumber()
      supportedProviders[chainId] = provider
    } catch {}
  }
}
