import { GuideSection, MethodCard } from './shared'

export const Gastos = () => (
  <div className="space-y-8">
    <GuideSection
      title="Como alimentar os Gastos"
      intro="Lance despesas manualmente (avulsas, fixas ou parceladas) ou importe o extrato do banco em OFX. O que for importado fica marcado como “banco”."
    >
      <MethodCard
        kind="manual"
        title="Gasto normal"
        where="Gastos › botão “Adicionar” › aba Normal"
        description="Despesa avulsa: descrição, valor, categoria e data. Um lançamento único."
      />
      <MethodCard
        kind="manual"
        title="Gasto fixo"
        where="Gastos › botão “Adicionar” › aba Fixo"
        description="Despesa recorrente mensal (aluguel, assinatura, etc.). Define o mês de início e, opcionalmente, o mês de término."
      />
      <MethodCard
        kind="manual"
        title="Gasto parcelado"
        where="Gastos › botão “Adicionar” › aba Parcelado"
        description="Valor total dividido em N parcelas — cada mês recebe a fração correspondente automaticamente."
      />
      <MethodCard
        kind="import"
        title="Importar extrato OFX"
        where="Gastos › botão “Importar extrato OFX”"
        description="Lê um arquivo .ofx do banco e sugere a categoria de cada transação por palavra-chave. Você revisa e confirma."
        note="Transações cujo FITID já existe vêm desmarcadas com “⚠ dup” — reimportar extrato sobreposto não duplica."
      />
    </GuideSection>
  </div>
)
