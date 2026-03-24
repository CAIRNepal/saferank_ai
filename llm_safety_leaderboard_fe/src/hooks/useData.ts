import { useQuery } from '@tanstack/react-query'
import {
  fetchArenaPair,
  fetchChangelog,
  fetchLeaderboard,
  fetchMethodology,
  fetchModelDetail,
  fetchOverview,
} from '../mocks/api'

export function useOverviewQuery() {
  return useQuery({ queryKey: ['overview'], queryFn: fetchOverview })
}

export function useLeaderboardQuery() {
  return useQuery({ queryKey: ['leaderboard'], queryFn: fetchLeaderboard })
}

export function useModelDetailQuery(modelId: string | undefined) {
  return useQuery({
    queryKey: ['model', modelId],
    queryFn: () => fetchModelDetail(modelId ?? ''),
    enabled: Boolean(modelId),
  })
}

export function useArenaPairQuery(cursor: number) {
  return useQuery({
    queryKey: ['arena', cursor],
    queryFn: () => fetchArenaPair(cursor),
  })
}

export function useMethodologyQuery() {
  return useQuery({ queryKey: ['methodology'], queryFn: fetchMethodology })
}

export function useChangelogQuery() {
  return useQuery({ queryKey: ['changelog'], queryFn: fetchChangelog })
}
