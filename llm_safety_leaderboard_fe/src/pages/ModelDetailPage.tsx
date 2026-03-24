import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { ScorePill } from '../components/domain/ScorePill'
import { ConfidenceBadge } from '../components/domain/ConfidenceBadge'
import { VersionBadge } from '../components/domain/VersionBadge'
import { useModelDetailQuery } from '../hooks/useData'
import { formatDate } from '../lib/format'

export function ModelDetailPage() {
  const { modelId } = useParams()
  const { data, isLoading, isError } = useModelDetailQuery(modelId)

  const axisData = useMemo(
    () => data?.model.axisScores.map((axis) => ({ axis: axis.axis, score: axis.score ?? 0 })) ?? [],
    [data],
  )

  if (isLoading) {
    return <Skeleton lines={9} />
  }

  if (isError || !data) {
    return <EmptyState title="Model not found" message="This model profile is unavailable." />
  }

  return (
    <div className="page-grid">
      <Card title={data.model.name} subtitle={data.model.provider}>
        <div className="inline-gap">
          <ScorePill score={data.model.overallScore} />
          <ConfidenceBadge confidence={data.model.confidence} />
          <VersionBadge version={data.model.benchmarkVersion} />
        </div>
        <p className="text-muted">Last evaluation {formatDate(data.model.lastUpdated)}</p>
      </Card>

      <Card title="Axis-level score breakdown">
        <div className="chart-wrap" aria-label="Axis score chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={axisData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="axis" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip />
              <Bar dataKey="score" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Trend history (dummy)">
        <div className="chart-wrap" aria-label="Trend chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[70, 100]} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="score" stroke="var(--accent-strong)" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Why this rank?">
        <ul className="clean-list">
          {data.whyThisRank.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
