import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Tooltip } from '../components/ui/Tooltip'
import { ScorePill } from '../components/domain/ScorePill'
import { ConfidenceBadge } from '../components/domain/ConfidenceBadge'
import { VersionBadge } from '../components/domain/VersionBadge'
import { useLeaderboardQuery } from '../hooks/useData'

type SortField = 'rank' | 'score'

export function LeaderboardPage() {
  const { data, isLoading, isError } = useLeaderboardQuery()
  const [provider, setProvider] = useState('all')
  const [modelType, setModelType] = useState<'all' | 'open' | 'closed'>('all')
  const [sortBy, setSortBy] = useState<SortField>('rank')

  const providers = useMemo(() => {
    if (!data) {
      return []
    }

    return Array.from(new Set(data.map((item) => item.provider)))
  }, [data])

  const filtered = useMemo(() => {
    if (!data) {
      return []
    }

    return data
      .filter((item) => (provider === 'all' ? true : item.provider === provider))
      .filter((item) => (modelType === 'all' ? true : item.modelType === modelType))
      .sort((a, b) => {
        if (sortBy === 'rank') {
          return a.rank - b.rank
        }

        return (b.overallScore ?? -1) - (a.overallScore ?? -1)
      })
  }, [data, provider, modelType, sortBy])

  if (isLoading) {
    return <Skeleton lines={10} />
  }

  if (isError || !data) {
    return <EmptyState title="Leaderboard unavailable" message="Unable to load model rankings." />
  }

  if (!filtered.length) {
    return <EmptyState title="No matching models" message="Try another filter combination." />
  }

  return (
    <div className="page-grid">
      <Card title="Leaderboard" subtitle="Bias and safety composite ranking">
        <div className="filters">
          <label>
            Provider
            <select value={provider} onChange={(event) => setProvider(event.target.value)}>
              <option value="all">All</option>
              {providers.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>

          <label>
            Model type
            <select
              value={modelType}
              onChange={(event) => setModelType(event.target.value as 'all' | 'open' | 'closed')}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <label>
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortField)}>
              <option value="rank">Rank</option>
              <option value="score">Score</option>
            </select>
          </label>
        </div>

        <DataTable
          columns={[
            { key: 'rank', title: 'Rank' },
            { key: 'model', title: 'Model' },
            { key: 'score', title: 'Overall' },
            { key: 'confidence', title: 'Confidence' },
            { key: 'version', title: 'Version' },
          ]}
          rows={filtered.map((model) => ({
            key: model.id,
            cells: [
              <span key="rank">#{model.rank}</span>,
              <div key="model">
                <Link to={`/models/${model.id}`} className="text-link">
                  {model.name}
                </Link>
                <p className="text-muted">
                  {model.provider} · {model.modelType}
                </p>
                <Tooltip content={model.rankChangeReason}>
                  <span className="delta">Δ {model.rankDelta >= 0 ? `+${model.rankDelta}` : model.rankDelta}</span>
                </Tooltip>
              </div>,
              <ScorePill key="score" score={model.overallScore} />,
              <ConfidenceBadge key="confidence" confidence={model.confidence} />,
              <VersionBadge key="version" version={model.benchmarkVersion} />,
            ],
          }))}
        />
      </Card>
    </div>
  )
}
