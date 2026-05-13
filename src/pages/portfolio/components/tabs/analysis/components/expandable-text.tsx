import { useEffect, useRef, useState } from 'react'

export const ExpandableText = ({ text, label }: { text: string; label: string }) => {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el) setClamped(el.scrollHeight > el.clientHeight)
  }, [text])

  return (
    <div className="pt-3 border-t border-border">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p
        ref={ref}
        className={`text-sm text-foreground leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}
      >
        {text}
      </p>
      {clamped && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}
