import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ScorePill } from '../components/domain/ScorePill'
import { ConfidenceBadge } from '../components/domain/ConfidenceBadge'
import { useOverviewQuery } from '../hooks/useData'
import { formatDate } from '../lib/format'

const MEDALS = ['🥇', '🥈', '🥉']

export function OverviewPage() {
  const { data, isLoading, isError } = useOverviewQuery()

  if (isLoading) {
    return <Skeleton lines={8} />
  }

  if (isError || !data) {
    return <EmptyState title="Overview unavailable" message="Unable to load summary metrics." />
  }

  return (
    <div className="page-grid">
      {/* Hero */}
      <div className="overview-hero">
        <div className="overview-hero-content">
          <h2 className="overview-hero-title">
            Transparent safety rankings<br />for large language models
          </h2>
          <p className="overview-hero-sub">
            Reproducible, metric-first evaluation combining automated benchmarks with pairwise human preference
            across fairness, toxicity, and over-refusal dimensions.
          </p>
          <div className="hero-cta-row">
            <Link className="button button-hero-solid" to="/leaderboard">
              View full leaderboard →
            </Link>
            <Link className="button button-hero" to="/submit">
              Submit your model
            </Link>
            <Link className="button button-hero" to="/methodology">
              How we evaluate
            </Link>
          </div>
        </div>
      </div>

      {/* Trust metrics */}
      <section className="stats-grid" aria-label="Platform metrics">
        <Card>
          <p className="stat-label">Models evaluated</p>
          <p className="stat-value">{data.trustMetrics.coverage}</p>
        </Card>
        <Card>
          <p className="stat-label">Last evaluation</p>
          <p className="stat-value">{formatDate(data.trustMetrics.lastEvaluation)}</p>
        </Card>
        <Card>
          <p className="stat-label">Methodology version</p>
          <p className="stat-value">{data.trustMetrics.methodologyVersion}</p>
        </Card>
      </section>

      {/* Top models */}
      <Card title="Top ranked models" subtitle="Current metric-first composite scores">
        <div className="top-list">
          {data.topModels.map((model, i) => (
            <article key={model.id} className="top-list-item">
              <div className="inline-gap">
                <span className="rank-medal" aria-label={`Rank ${model.rank}`}>{MEDALS[i] ?? `#${model.rank}`}</span>
                <div>
                  <p className="item-title">{model.name}</p>
                  <p className="text-muted">{model.provider}</p>
                </div>
              </div>
              <div className="inline-gap">
                <ScorePill score={model.overallScore} />
                <ConfidenceBadge confidence={model.confidence} />
                <Link className="text-link" to={`/models/${model.id}`}>
                  Details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}
