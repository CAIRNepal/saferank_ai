import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <div className="page-grid">
      <EmptyState title="Page not found" message="The route you requested does not exist." />
      <Link className="button button-secondary" to="/overview">
        Back to overview
      </Link>
    </div>
  )
}
