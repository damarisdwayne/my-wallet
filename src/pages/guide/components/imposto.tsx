import { GuideSection, MethodCard } from './shared'

export const Imposto = () => (
  <div className="space-y-8">
    <GuideSection
      title="Como alimentar o Imposto de Renda"
      intro="A página de IR não tem cadastro próprio: tudo é calculado a partir da sua carteira, trades e proventos. Para o IR ficar correto, o trabalho é manter esses dados em dia."
    >
      <MethodCard
        kind="auto"
        title="Cálculo automático"
        where="Imposto de Renda"
        description="Preço médio fiscal, ganho de capital, isenções, DARF e a seção de bens são derivados automaticamente dos dados cadastrados."
      />
      <MethodCard
        kind="manual"
        title="O que você alimenta"
        where="Carteira e Proventos"
        description="Registre todas as compras/vendas (para o ganho de capital e o PM fiscal) e mantenha os proventos importados — é isso que abastece o IR."
      />
    </GuideSection>
  </div>
)
