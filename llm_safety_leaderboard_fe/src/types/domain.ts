export type Confidence = 'high' | 'medium' | 'low' | 'provisional'

export type AxisScore = {
  axis: string
  score: number | null
}

export type LeaderboardModel = {
  id: string
  name: string
  provider: string
  modelType: 'open' | 'closed'
  rank: number
  rankDelta: number
  rankChangeReason: string
  overallScore: number | null
  confidence: Confidence
  benchmarkVersion: string
  lastUpdated: string
  axisScores: AxisScore[]
}

export type TrendPoint = {
  label: string
  score: number
}

export type ModelDetail = {
  model: LeaderboardModel
  trend: TrendPoint[]
  whyThisRank: string[]
}

export type ArenaPair = {
  id: string
  prompt: string
  leftModelId: string
  rightModelId: string
  leftResponse: string
  rightResponse: string
  randomized: boolean
}

export type MethodologyVersion = {
  version: string
  publishedAt: string
  summary: string
  benchmarkSuites: string[]
}

export type MetricDefinition = {
  name: string
  weight: number
  description: string
}

export type ChangelogEntry = {
  id: string
  date: string
  title: string
  details: string
  impact: 'low' | 'medium' | 'high'
}
