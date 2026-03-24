import clsx from 'clsx'

type TabItem = {
  id: string
  label: string
}

type Props = {
  items: TabItem[]
  activeId: string
  onSelect: (id: string) => void
}

export function Tabs({ items, activeId, onSelect }: Props) {
  return (
    <div className="tabs" role="tablist" aria-label="Methodology versions">
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={activeId === item.id}
          className={clsx('tab', activeId === item.id && 'active')}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
