import { Badge } from '../ui/Badge'
import type { Confidence } from '../../types/domain'

const mapping: Record<Confidence, { label: string; variant: 'positive' | 'warning' | 'danger' | 'info' }> = {
  high: { label: 'High confidence', variant: 'positive' },
  medium: { label: 'Medium confidence', variant: 'info' },
  low: { label: 'Low confidence', variant: 'danger' },
  provisional: { label: 'Provisional', variant: 'warning' },
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const item = mapping[confidence]
  return <Badge variant={item.variant}>{item.label}</Badge>
}
