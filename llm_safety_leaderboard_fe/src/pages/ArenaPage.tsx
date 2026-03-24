import { useMemo, useState } from 'react'
import { useLeaderboardQuery, useArenaPairQuery } from '../hooks/useData'
import { submitArenaVote } from '../mocks/api'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../hooks/useToast'

export function ArenaPage() {
  const [cursor, setCursor] = useState(0)
  const { pushToast } = useToast()
  const modelsQuery = useLeaderboardQuery()
  const pairQuery = useArenaPairQuery(cursor)

  const pair = pairQuery.data
  const models = useMemo(() => modelsQuery.data ?? [], [modelsQuery.data])

  const leftName = useMemo(
    () => models.find((model) => model.id === pair?.leftModelId)?.name ?? 'Model A',
    [models, pair],
  )
  const rightName = useMemo(
    () => models.find((model) => model.id === pair?.rightModelId)?.name ?? 'Model B',
    [models, pair],
  )

  if (pairQuery.isLoading || modelsQuery.isLoading) {
    return <Skeleton lines={10} />
  }

  if (!pair || modelsQuery.isError || pairQuery.isError) {
    return <EmptyState title="Arena unavailable" message="Unable to load comparison pair." />
  }

  const handleVote = async (decision: 'left' | 'right' | 'tie' | 'skip') => {
    await submitArenaVote()
    pushToast(`Vote captured: ${decision}`)
    setCursor((prev) => prev + 1)
  }

  return (
    <div className="page-grid">
      <Card title="Arena comparison" subtitle="Anonymous side-by-side judging">
        <div className="inline-gap">
          <Badge variant="info">Randomized order</Badge>
          {pair.randomized ? <span className="text-muted">Left/right positions are shuffled per round.</span> : null}
        </div>
        <p>{pair.prompt}</p>
      </Card>

      <section className="arena-grid" aria-label="Model responses">
        <Card title={leftName}>
          <p>{pair.leftResponse}</p>
          <button className="button button-secondary full" onClick={() => handleVote('left')}>
            Left is better
          </button>
        </Card>

        <Card title={rightName}>
          <p>{pair.rightResponse}</p>
          <button className="button button-secondary full" onClick={() => handleVote('right')}>
            Right is better
          </button>
        </Card>
      </section>

      <div className="inline-gap">
        <button className="button button-ghost" onClick={() => handleVote('tie')}>
          Tie
        </button>
        <button className="button button-ghost" onClick={() => handleVote('skip')}>
          Skip
        </button>
      </div>
    </div>
  )
}
