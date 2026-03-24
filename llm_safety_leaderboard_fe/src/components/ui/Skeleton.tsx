type Props = {
  lines?: number
}

export function Skeleton({ lines = 3 }: Props) {
  return (
    <div className="skeleton-wrap" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div className="skeleton-line" key={index} />
      ))}
    </div>
  )
}
