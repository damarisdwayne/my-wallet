import { Calendar, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface MetaItem {
  label: string
  value: string
}

// Renders the "Data do Relatório" / "Tipo de Documento" header lines as compact badges.
export const MetaRow = ({ items }: { items: MetaItem[] }) => {
  if (!items.length) return null
  return (
    <>
      {items.map((item) => {
        const Icon = item.label.toLowerCase().includes('data') ? Calendar : FileText
        return (
          <Badge key={item.label} variant="outline" className="gap-1.5 font-normal">
            <Icon size={11} className="text-muted-foreground" />
            <span className="font-medium text-foreground">{item.value}</span>
          </Badge>
        )
      })}
    </>
  )
}
