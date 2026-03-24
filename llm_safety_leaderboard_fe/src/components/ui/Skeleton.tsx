type Props = {
  lines?: number
  title?: string
}

export function Skeleton({ lines = 3, title }: Props) {
  return (
    <div className="skeleton-wrap">
      {title && <p className="text-muted skeleton-hint">{title}</p>}
      <div aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <div className="skeleton-line" key={index} style={{ width: index % 3 === 2 ? '60%' : '100%', marginBottom: '10px' }} />
        ))}
      </div>
    </div>
  )
}
