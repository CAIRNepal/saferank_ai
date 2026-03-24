export function formatScore(score: number | null): string {
  if (score === null) {
    return 'N/A'
  }

  return score.toFixed(1)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}
