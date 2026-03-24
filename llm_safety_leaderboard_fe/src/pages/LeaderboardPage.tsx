import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Tooltip } from '../components/ui/Tooltip'
import { ConfidenceBadge } from '../components/domain/ConfidenceBadge'
import { VersionBadge } from '../components/domain/VersionBadge'
import { scoreClass } from '../components/domain/ScorePill'
import { useLeaderboardQuery } from '../hooks/useData'

type SortField = 'rank' | 'score'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const DEFAULT_PROVIDER = 'all'
const DEFAULT_TYPE = 'all' as const
const DEFAULT_SORT: SortField = 'rank'
const DEFAULT_SEARCH = ''

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted">N/A</span>
  const cls = scoreClass(score)
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track" title={`${score}/100`}>
        <div className={`score-bar-fill score-bar-${cls}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`score-bar-label ${cls}`}>{score}</span>
    </div>
  )
}

export function LeaderboardPage() {
  const { data, isLoading, isError } = useLeaderboardQuery()
  const navigate = useNavigate()
  const [provider, setProvider] = useState(DEFAULT_PROVIDER)
  const [modelType, setModelType] = useState<'all' | 'open' | 'closed'>(DEFAULT_TYPE)
  const [sortBy, setSortBy] = useState<SortField>(DEFAULT_SORT)
  const [search, setSearch] = useState(DEFAULT_SEARCH)

  const isFiltered =
    provider !== DEFAULT_PROVIDER ||
    modelType !== DEFAULT_TYPE ||
    sortBy !== DEFAULT_SORT ||
    search !== DEFAULT_SEARCH

  const clearFilters = () => {
    setProvider(DEFAULT_PROVIDER)
    setModelType(DEFAULT_TYPE)
    setSortBy(DEFAULT_SORT)
    setSearch(DEFAULT_SEARCH)
  }

  const providers = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.map((item) => item.provider)))
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return data
      .filter((item) => (provider === 'all' ? true : item.provider === provider))
      .filter((item) => (modelType === 'all' ? true : item.modelType === modelType))
      .filter((item) => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return item.name.toLowerCase().includes(q) || item.provider.toLowerCase().includes(q)
      })
      .sort((a, b) => {
        if (sortBy === 'rank') return a.rank - b.rank
        return (b.overallScore ?? -1) - (a.overallScore ?? -1)
      })
  }, [data, provider, modelType, sortBy, search])

  if (isLoading) {
    return <Skeleton lines={10} />
  }

  if (isError || !data) {
    return <EmptyState title="Leaderboard unavailable" message="Unable to load model rankings." />
  }

  return (
    <div className="page-grid">
      <Card
        title="Safety Leaderboard"
        subtitle="Bias and safety composite ranking across all evaluated models"
      >
        <div className="filters">
          <div className="search-field">
            Search
            <input
              className="search-input"
              type="search"
              placeholder="Search model or provider…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search models"
            />
          </div>

          <label>
            Provider
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="all">All providers</option>
              {providers.map((entry) => (
                <option key={entry} value={entry}>{entry}</option>
              ))}
            </select>
          </label>

          <label>
            Type
            <select value={modelType} onChange={(e) => setModelType(e.target.value as 'all' | 'open' | 'closed')}>
              <option value="all">All types</option>
              <option value="open">Open weights</option>
              <option value="closed">Closed / API</option>
            </select>
          </label>

          <label>
            Sort by
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)}>
              <option value="rank">Rank</option>
              <option value="score">Score</option>
            </select>
          </label>
        </div>

        {/* Result count + clear filters */}
        <div className="filter-meta">
          <span className="text-muted">
            Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong> models
          </span>
          <div className="score-legend" aria-label="Score colour legend">
            <span className="legend-dot score-high" />Good ≥85
            <span className="legend-dot score-mid" />Moderate 70–84
            <span className="legend-dot score-low" />Needs work &lt;70
          </div>
          {isFiltered && (
            <button className="button button-ghost button-sm" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No matching models"
            message="Try adjusting your filters or search query."
            action={
              <button className="button button-ghost button-sm" onClick={clearFilters}>
                Clear filters
              </button>
            }
          />
        ) : (
          <DataTable
            columns={[
              { key: 'rank', title: 'Rank' },
              { key: 'model', title: 'Model' },
              { key: 'score', title: 'Safety score' },
              { key: 'confidence', title: 'Confidence' },
              { key: 'version', title: 'Version' },
            ]}
            onRowClick={(id) => navigate(`/models/${id}`)}
            rows={filtered.map((model) => ({
              key: model.id,
              cells: [
                <span key="rank" style={{ fontSize: '1.2rem' }}>
                  {MEDALS[model.rank] ?? (
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>
                      #{model.rank}
                    </span>
                  )}
                </span>,
                <div key="model">
                  <Link to={`/models/${model.id}`} className="text-link">
                    {model.name}
                  </Link>
                  <p className="text-muted">
                    {model.provider} · <span style={{ textTransform: 'capitalize' }}>{model.modelType}</span>
                  </p>
                  <Tooltip content={model.rankChangeReason}>
                    <span className={
                      model.rankDelta > 0 ? 'delta delta-up'
                      : model.rankDelta < 0 ? 'delta delta-down'
                      : 'delta'
                    }>
                      {model.rankDelta === 0 ? '–' : model.rankDelta > 0 ? `▲ +${model.rankDelta}` : `▼ ${model.rankDelta}`}
                    </span>
                  </Tooltip>
                </div>,
                <ScoreBar key="score" score={model.overallScore} />,
                <ConfidenceBadge key="confidence" confidence={model.confidence} />,
                <VersionBadge key="version" version={model.benchmarkVersion} />,
              ],
            }))}
          />
        )}
      </Card>
    </div>
  )
}
