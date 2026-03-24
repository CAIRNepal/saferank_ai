import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ScorePill } from '../components/domain/ScorePill'
import { ConfidenceBadge } from '../components/domain/ConfidenceBadge'
import { useOverviewQuery } from '../hooks/useData'
import { formatDate } from '../lib/format'

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
      <Card title="Platform purpose" subtitle="Bias and safety-first benchmark intelligence">
        <p>
          This leaderboard combines reproducible evaluation metrics with pairwise human preference to
          keep early rankings stable and transparent.
        </p>
      </Card>

      <section className="stats-grid" aria-label="Trust metrics">
        <Card title="Coverage">
          <p className="stat-value">{data.trustMetrics.coverage}</p>
        </Card>
        <Card title="Last evaluation">
          <p className="stat-value">{formatDate(data.trustMetrics.lastEvaluation)}</p>
        </Card>
        <Card title="Methodology version">
          <p className="stat-value">{data.trustMetrics.methodologyVersion}</p>
        </Card>
      </section>

      <Card title="Top ranked models" subtitle="Current metric-first baseline">
        <div className="top-list">
          {data.topModels.map((model) => (
            <article key={model.id} className="top-list-item">
              <div>
                <p className="item-title">
                  #{model.rank} {model.name}
                </p>
                <p className="text-muted">{model.provider}</p>
              </div>
              <div className="inline-gap">
                <ScorePill score={model.overallScore} />
                <ConfidenceBadge confidence={model.confidence} />
                <Link className="text-link" to={`/models/${model.id}`}>
                  View model
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}
