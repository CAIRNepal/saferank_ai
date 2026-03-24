import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Badge } from '../components/ui/Badge'
import { useChangelogQuery } from '../hooks/useData'
import { formatDate } from '../lib/format'
import type { ChangelogEntry } from '../types/domain'

type ImpactFilter = 'all' | ChangelogEntry['impact']

const IMPACT_VARIANT: Record<ChangelogEntry['impact'], 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
}

export function ChangelogPage() {
  const { data, isLoading, isError } = useChangelogQuery()
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('all')

  if (isLoading) {
    return <Skeleton lines={8} />
  }

  if (isError || !data) {
    return <EmptyState title="Changelog unavailable" message="Unable to load release history." />
  }

  const filtered = impactFilter === 'all' ? data : data.filter((e) => e.impact === impactFilter)

  return (
    <div className="page-grid">
      <Card title="Changelog" subtitle="Trace rank and benchmark evolution">
        {/* Impact filter */}
        <div className="changelog-filters">
          {(['all', 'high', 'medium', 'low'] as ImpactFilter[]).map((level) => (
            <button
              key={level}
              className={`button button-sm ${impactFilter === level ? 'button-secondary' : 'button-ghost'}`}
              onClick={() => setImpactFilter(level)}
              aria-pressed={impactFilter === level}
            >
              {level === 'all' ? 'All' : `${level.charAt(0).toUpperCase() + level.slice(1)} impact`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No entries"
            message={`No ${impactFilter}-impact entries found.`}
            action={
              <button className="button button-ghost button-sm" onClick={() => setImpactFilter('all')}>
                Show all
              </button>
            }
          />
        ) : (
          <ol className="timeline">
            {filtered.map((entry) => (
              <li key={entry.id} className="timeline-item">
                <div
                  className={`timeline-dot timeline-dot-${entry.impact}`}
                  aria-hidden="true"
                />
                <div>
                  <div className="inline-gap wrap">
                    <p className="item-title">{entry.title}</p>
                    <Badge variant={IMPACT_VARIANT[entry.impact]}>
                      {entry.impact} impact
                    </Badge>
                  </div>
                  <p className="text-muted">{formatDate(entry.date)}</p>
                  <p>{entry.details}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  )
}
