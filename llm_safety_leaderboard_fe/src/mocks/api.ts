import {
  arenaPairs,
  changelogEntries,
  leaderboardModels,
  methodologyVersions,
  metricDefinitions,
  modelDetails,
} from './data'
import type { ArenaPair, ModelDetail } from '../types/domain'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchOverview() {
  await wait(320)

  return {
    topModels: leaderboardModels.slice(0, 3),
    trustMetrics: {
      coverage: '93% benchmark coverage',
      lastEvaluation: '2026-03-22',
      methodologyVersion: methodologyVersions[0]?.version ?? 'v1.0',
    },
  }
}

export async function fetchLeaderboard() {
  await wait(420)
  return leaderboardModels
}

export async function fetchModelDetail(modelId: string): Promise<ModelDetail | null> {
  await wait(380)
  return modelDetails.find((detail) => detail.model.id === modelId) ?? null
}

export async function fetchArenaPair(cursor: number): Promise<ArenaPair> {
  await wait(240)
  return arenaPairs[cursor % arenaPairs.length]
}

export async function submitArenaVote() {
  await wait(260)
  return { success: true }
}

export async function fetchMethodology() {
  await wait(260)
  return {
    versions: methodologyVersions,
    metrics: metricDefinitions,
  }
}

export async function fetchChangelog() {
  await wait(240)
  return changelogEntries
}
