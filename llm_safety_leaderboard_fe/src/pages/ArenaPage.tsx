import { useEffect, useMemo, useState } from 'react'
import { useLeaderboardQuery, useArenaPairQuery } from '../hooks/useData'
import { submitArenaVote } from '../mocks/api'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
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

  const handleVote = async (decision: 'left' | 'right' | 'tie' | 'skip') => {
    await submitArenaVote()
    const labels: Record<string, string> = {
      left: `Voted: ${leftName} is better`,
      right: `Voted: ${rightName} is better`,
      tie: 'Voted: Tie',
      skip: 'Round skipped',
    }
    pushToast(labels[decision], decision === 'skip' ? 'info' : 'success')
    setCursor((prev) => prev + 1)
  }

  // Keyboard shortcuts: 1=left, 2=right, t=tie, s=skip
  useEffect(() => {
    if (!pair) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === '1') handleVote('left')
      else if (e.key === '2') handleVote('right')
      else if (e.key === 't' || e.key === 'T') handleVote('tie')
      else if (e.key === 's' || e.key === 'S') handleVote('skip')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair])

  if (pairQuery.isLoading || modelsQuery.isLoading) {
    return <Skeleton lines={10} />
  }

  if (!pair || modelsQuery.isError || pairQuery.isError) {
    return <EmptyState title="Arena unavailable" message="Unable to load comparison pair." />
  }

  return (
    <div className="page-grid">
      {/* Header: round counter + prompt */}
      <Card
        title="Arena"
        subtitle="Anonymous side-by-side safety judging — identities revealed after your vote"
      >
        <div className="arena-meta">
          <Badge variant="neutral">Round {cursor + 1}</Badge>
          {pair.randomized && (
            <Badge variant="info">Positions randomised</Badge>
          )}
        </div>
        <blockquote className="arena-prompt">{pair.prompt}</blockquote>
      </Card>

      {/* Side-by-side responses — no vote buttons inside */}
      <section className="arena-grid" aria-label="Model responses">
        <Card title="Response A">
          <p className="arena-response">{pair.leftResponse}</p>
        </Card>
        <Card title="Response B">
          <p className="arena-response">{pair.rightResponse}</p>
        </Card>
      </section>

      {/* Unified vote bar */}
      <div className="vote-bar" role="group" aria-label="Cast your vote">
        <button className="button button-secondary vote-btn-left" onClick={() => handleVote('left')}>
          ← A is better
        </button>
        <button className="button button-ghost" onClick={() => handleVote('tie')}>
          Tie
        </button>
        <button className="button button-ghost" onClick={() => handleVote('skip')}>
          Skip
        </button>
        <button className="button button-secondary vote-btn-right" onClick={() => handleVote('right')}>
          B is better →
        </button>
      </div>

      <p className="arena-shortcuts text-muted">
        Keyboard shortcuts: <kbd>1</kbd> A better · <kbd>2</kbd> B better · <kbd>T</kbd> Tie · <kbd>S</kbd> Skip
      </p>
    </div>
  )
}
