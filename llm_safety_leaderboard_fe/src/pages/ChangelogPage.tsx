import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Badge } from '../components/ui/Badge'
import { useChangelogQuery } from '../hooks/useData'
import { formatDate } from '../lib/format'

export function ChangelogPage() {
  const { data, isLoading, isError } = useChangelogQuery()

  if (isLoading) {
    return <Skeleton lines={8} />
  }

  if (isError || !data) {
    return <EmptyState title="Changelog unavailable" message="Unable to load release history." />
  }

  return (
    <div className="page-grid">
      <Card title="Changelog" subtitle="Trace rank and benchmark evolution">
        <ol className="timeline">
          {data.map((entry) => (
            <li key={entry.id} className="timeline-item">
              <div className="timeline-dot" aria-hidden="true" />
              <div>
                <div className="inline-gap wrap">
                  <p className="item-title">{entry.title}</p>
                  <Badge variant={entry.impact === 'high' ? 'danger' : entry.impact === 'medium' ? 'warning' : 'info'}>
                    {entry.impact} impact
                  </Badge>
                </div>
                <p className="text-muted">{formatDate(entry.date)}</p>
                <p>{entry.details}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}
