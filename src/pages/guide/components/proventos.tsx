import { GuideSection, MethodCard } from './shared'

export const Proventos = () => (
  <div className="space-y-8">
    <GuideSection
      title="Como alimentar os Proventos"
      intro="Você não digita provento a provento. Eles chegam pelas importações e o site ainda projeta os que estão por vir. A página de Proventos serve para consultar e, se preciso, excluir."
    >
      <MethodCard
        kind="import"
        title="Proventos da B3 (Movimentação)"
        where="Carteira › Importar nota › B3 (relatório de Movimentação)"
        description="Dividendos, JCP e rendimentos dos ativos nacionais entram pela importação do relatório de Movimentação da B3."
      />
      <MethodCard
        kind="import"
        title="Dividendos em USD (Inter)"
        where="Carteira › Importar nota › Inter › modo Extrato"
        description="Dividendos recebidos no exterior entram pelo extrato da Inter, em USD."
      />
      <MethodCard
        kind="auto"
        title="Proventos futuros"
        where="Automático"
        description="Proventos anunciados e ainda não pagos são buscados automaticamente para os ativos da sua carteira, para você ver o que está por vir."
      />
      <MethodCard
        kind="manual"
        title="Excluir provento"
        where="Página de Proventos (também como aba da Carteira)"
        description="A página é de consulta. A única edição disponível é excluir um provento — não há cadastro manual individual."
        note="Proventos são idempotentes por id (ticker-data-tipo): reimportar sobrescreve, não duplica."
      />
    </GuideSection>
  </div>
)
