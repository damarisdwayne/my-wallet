import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Asset, PortfolioCategory } from '@/types'
import { FixedIncomeForm } from '../../../dialog/add-asset-dialog/components'

interface Props {
  categories: PortfolioCategory[]
  defaultTotalInvested: number
  onClose: () => void
  onSave: (asset: Partial<Asset>) => Promise<void>
}

// Renda fixa não soma à posição como ações — cada título é um registro novo, com metadados
// (tipo, taxa, vencimento, instituição). Por isso reaproveitamos o formulário já existente.
export const RegisterFixedIncomeDialog = ({
  categories,
  defaultTotalInvested,
  onClose,
  onSave,
}: Props) => (
  <Dialog open onOpenChange={(v) => !v && onClose()}>
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Lançar renda fixa</DialogTitle>
      </DialogHeader>
      <FixedIncomeForm
        categories={categories}
        defaultTotalInvested={defaultTotalInvested > 0 ? defaultTotalInvested.toFixed(2) : ''}
        onSave={(partial) => {
          void onSave(partial).then(onClose)
        }}
      />
    </DialogContent>
  </Dialog>
)
