import { Badge } from '../ui/Badge'

export function VersionBadge({ version }: { version: string }) {
  return <Badge variant="neutral">{version}</Badge>
}
