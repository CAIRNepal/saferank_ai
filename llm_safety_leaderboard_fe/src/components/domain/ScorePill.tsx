import { formatScore } from '../../lib/format'

export function ScorePill({ score }: { score: number | null }) {
  return <span className="score-pill">{formatScore(score)}</span>
}
