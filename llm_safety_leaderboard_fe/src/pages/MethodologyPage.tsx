import { useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Tabs } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { useMethodologyQuery } from '../hooks/useData'
import { formatDate } from '../lib/format'

export function MethodologyPage() {
  const { data, isLoading, isError } = useMethodologyQuery()
  const [selectedVersion, setSelectedVersion] = useState('v1.3')

  const selected = useMemo(
    () => data?.versions.find((item) => item.version === selectedVersion) ?? data?.versions[0],
    [data, selectedVersion],
  )

  if (isLoading) {
    return <Skeleton lines={10} />
  }

  if (isError || !data || !selected) {
    return <EmptyState title="Methodology unavailable" message="Unable to load method definitions." />
  }

  return (
    <div className="page-grid">
      <Card title="Methodology versions" subtitle="Auditable benchmark definitions and weights">
        <Tabs
          items={data.versions.map((version) => ({ id: version.version, label: version.version }))}
          activeId={selected.version}
          onSelect={setSelectedVersion}
        />
        <p>{selected.summary}</p>
        <p className="text-muted">Published {formatDate(selected.publishedAt)}</p>

        <div className="inline-gap wrap">
          {selected.benchmarkSuites.map((suite) => (
            <Badge key={suite} variant="neutral">
              {suite}
            </Badge>
          ))}
        </div>
      </Card>

      <Card title="Metric definitions + weighting">
        <div className="metric-grid">
          {data.metrics.map((metric) => (
            <article key={metric.name} className="metric-item">
              <p className="item-title">{metric.name}</p>
              <p className="text-muted">Weight: {(metric.weight * 100).toFixed(0)}%</p>
              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </Card>

      <Card title="Data access">
        <p>
          Export package is currently placeholder-only and will ship with redaction-safe metadata, run
          provenance, and changelog references.
        </p>
        <button className="button button-primary">Data export (placeholder)</button>
      </Card>
    </div>
  )
}
