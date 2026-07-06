import { GuideSection, MethodCard } from './shared'

export const Carteira = () => (
  <div className="space-y-8">
    <GuideSection
      title="Como alimentar a Carteira"
      intro="Suas posições (ações, FIIs, BDRs, ETFs, exterior, Tesouro, renda fixa e cripto) podem ser lançadas manualmente ou importadas dos relatórios da sua corretora. As duas formas convivem — importe o histórico e ajuste no manual o que faltar."
    >
      <MethodCard
        kind="manual"
        title="Nova operação"
        where="Carteira › Visão Geral › botão “Nova operação”"
        description="Lançamento avulso de qualquer operação. Escolha a operação, o tipo de ativo e preencha o formulário."
        details={[
          'Compra de ação, FII, BDR, ETF e ativos no exterior',
          'Venda, bonificação e amortização sobre posições existentes',
          'Renda fixa / Tesouro (índice, taxa, vencimento)',
          'Cripto (com custo em USD)',
        ]}
      />
      <MethodCard
        kind="import"
        title="Importar nota (B3)"
        where="Carteira › Visão Geral › botão “Importar nota” › B3"
        description="Lê os dois relatórios do Excel exportado pela área do investidor da B3."
        details={[
          'Extrato de Negociação → compras/vendas (atualiza posição e PM)',
          'Movimentação → proventos e Tesouro Direto',
        ]}
        note="Eventos corporativos (desdobro, grupamento) não vêm da Movimentação — a Negociação já reflete a posição pós-evento. Lance-os manualmente se necessário."
      />
      <MethodCard
        kind="import"
        title="Importar nota (Inter — EUA)"
        where="Carteira › Visão Geral › botão “Importar nota” › Inter Co Securities"
        description="Importa a Transaction Confirmation da Inter (investimentos nos EUA)."
        details={[
          'Modo Negociações → compras/vendas em USD',
          'Modo Extrato → dividendos recebidos em USD',
        ]}
      />
      <MethodCard
        kind="manual"
        title="Lançar aporte na posição"
        where="Carteira › aba “Simular Aporte”"
        description="Registra uma compra (ou renda fixa) direto sobre um ativo já existente, sem abrir o fluxo completo de nova operação."
      />
      <MethodCard
        kind="auto"
        title="Preços e cotações"
        where="Automático"
        description="As cotações e a variação dos ativos são buscadas automaticamente — você não precisa digitar preço de mercado. Você só informa preço na hora de registrar a operação."
      />
    </GuideSection>

    <GuideSection
      title="Reimportar sem duplicar"
      intro="A B3 exporta janelas sobrepostas de ~30 dias, então reimportar é normal e seguro."
    >
      <MethodCard
        kind="import"
        title="Deduplicação no preview"
        where="No modal de importação"
        description="Operações que já existem aparecem desmarcadas, em cor de aviso e com o selo “⚠ dup”. Confirmar sem revisar nunca duplica."
      />
      <MethodCard
        kind="manual"
        title="Reverter importação"
        where="Carteira › aba “Movimentações / Importações”"
        description="Desfaz uma importação: restaura as posições e apaga os trades daquele lote. Proventos não são apagados (são idempotentes)."
      />
    </GuideSection>
  </div>
)
