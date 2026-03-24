import { formatScore } from '../../lib/format'

function scoreClass(score: number | null): string {
  if (score === null) return 'score-null'
  if (score >= 85) return 'score-high'
  if (score >= 70) return 'score-mid'
  return 'score-low'
}

export function ScorePill({ score }: { score: number | null }) {
  return (
    <span className={`score-pill ${scoreClass(score)}`}>
      {formatScore(score)}
    </span>
  )
}

export { scoreClass }
