import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Section } from './shared'

export const ReservaValor = () => (
  <div className="space-y-8">
    <Section title="O que é Reserva de Valor?">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Reserva de valor é a propriedade de um ativo de manter (ou aumentar) seu poder de compra ao longo do tempo, resistindo à inflação, crises e instabilidades sistêmicas. Não é o mesmo que alta rentabilidade — é proteção patrimonial.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Em carteiras bem construídas, uma parcela pequena (5-15%) em ativos de reserva de valor ajuda a reduzir a volatilidade geral e oferece proteção em cenários extremos: guerras, colapsos monetários, crises bancárias.
      </p>
    </Section>

    <Section title="Ouro — O Ativo Milenar">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            O ouro é reconhecido como reserva de valor há mais de 5.000 anos. Sua oferta é limitada fisicamente — não pode ser criado por governos ou bancos centrais. Por isso, tende a se valorizar em termos de moeda quando há inflação ou crise de confiança nas instituições.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/30 rounded p-3 space-y-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">Vantagens</p>
              <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                <li>• Proteção contra inflação de longo prazo</li>
                <li>• Baixa correlação com ações e renda fixa</li>
                <li>• Aceito globalmente, sem risco de contraparte</li>
                <li>• Reserva durante crises geopolíticas</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded p-3 space-y-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Limitações</p>
              <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                <li>• Não paga dividendos ou juros</li>
                <li>• Alta volatilidade no curto prazo</li>
                <li>• Custo de custódia e spread de compra/venda</li>
                <li>• Não é produtivo — não gera valor intrínseco</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Como investir em ouro no Brasil</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                name: 'GOLD11 (ETF)',
                desc: 'ETF listado na B3 que replica o preço do ouro em dólares, convertido para reais. Combina exposição ao ouro + dólar. Mais prático e líquido. Taxas baixas.',
                badge: 'Recomendado',
              },
              {
                name: 'OZ1D (contrato futuro)',
                desc: 'Contratos de ouro negociados na B3 em grama. Mais complexo, exige conta habilitada para derivativos. Mais adequado para investidores avançados.',
                badge: 'Avançado',
              },
              {
                name: 'Fundos de ouro',
                desc: 'Fundos geridos que investem em ouro. Têm taxa de administração e podem ter saídas menos eficientes que ETFs. Verifique a taxa antes de investir.',
                badge: 'Verificar taxa',
              },
              {
                name: 'Ouro físico',
                desc: 'Barras e moedas de ouro. Problema de custódia, seguro e spread alto de compra/venda. Faz mais sentido como objeto de coleção do que investimento puro.',
                badge: 'Custódia complexa',
              },
            ].map((item) => (
              <Card key={item.name} className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm text-foreground">{item.name}</span>
                  <Badge variant="outline" className="text-xs">{item.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Tributação do Ouro</p>
          <p className="text-sm text-muted-foreground">
            Ouro físico e contratos OZ1D: ganho de capital tributado como renda variável — 15% para Swing Trade, 20% para Day Trade. GOLD11 (ETF): 15% sobre o ganho na venda, sem isenção de R$ 20k.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Bitcoin — Ouro Digital">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bitcoin foi criado em 2009 como um sistema de pagamento descentralizado. Com o tempo, passou a ser usado como reserva de valor — especialmente em países com instabilidade monetária. Sua oferta é limitada matematicamente a 21 milhões de unidades.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A narrativa de "ouro digital" tem ganhado força: assim como o ouro, o Bitcoin não tem contraparte central, não pode ser confiscado digitalmente se armazenado corretamente, e sua escassez é algorítmica, não física.
          </p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="p-3 bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800 space-y-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Argumentos a favor</p>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>• Oferta máxima de 21M de unidades (escassez real)</li>
              <li>• Descentralizado — nenhum governo controla</li>
              <li>• Portabilidade superior ao ouro físico</li>
              <li>• Adoção institucional crescente (ETFs de BTC)</li>
              <li>• 15 anos sem falhas de protocolo</li>
            </ul>
          </Card>
          <Card className="p-3 bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 space-y-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Riscos e limitações</p>
            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
              <li>• Alta volatilidade — quedas de 80% em ciclos de baixa</li>
              <li>• Risco regulatório (governos podem restringir)</li>
              <li>• Sem respaldo histórico de milênios como o ouro</li>
              <li>• Complexidade de custódia segura (wallets, seeds)</li>
              <li>• Risco de exchanges — "Not your keys, not your coins"</li>
            </ul>
          </Card>
        </div>

        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Como investir em Bitcoin no Brasil</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                name: 'ETFs de BTC (BITH11, QBTC11)',
                desc: 'A forma mais simples e regulada. Listados na B3, sem precisar de conta em exchange ou gerenciar carteira. IR igual a ETFs de ações: 15% sobre ganho.',
                badge: 'Recomendado para iniciantes',
              },
              {
                name: 'Exchanges nacionais',
                desc: 'Mercado Bitcoin, Foxbit, Coinext. Reguladas pelo Banco Central. Mais barato em taxas que ETFs, mas exige gestão de segurança da conta.',
                badge: 'Controle direto',
              },
              {
                name: 'Self-custody (hardware wallet)',
                desc: 'Ledger, Trezor. Você guarda suas próprias chaves. Máxima segurança mas exige responsabilidade total — perder o seed = perder os BTC.',
                badge: 'Avançado',
              },
            ].map((item) => (
              <Card key={item.name} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-sm text-foreground">{item.name}</span>
                  <Badge variant="outline" className="text-xs shrink-0">{item.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Tributação do Bitcoin</p>
          <p className="text-sm text-muted-foreground">
            Criptomoedas são tributadas como ativos de renda variável no Brasil. Ganhos na venda:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            {[
              { faixa: 'Ganho até R$ 5 milhões', aliq: '15%' },
              { faixa: 'R$ 5M a R$ 10M', aliq: '17,5%' },
              { faixa: 'R$ 10M a R$ 30M', aliq: '20%' },
              { faixa: 'Acima de R$ 30M', aliq: '22,5%' },
            ].map((row) => (
              <div key={row.faixa} className="flex justify-between bg-muted rounded px-3 py-2">
                <span className="text-muted-foreground">{row.faixa}</span>
                <span className="font-medium text-foreground">{row.aliq}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Isenção para vendas mensais abaixo de R$ 35.000 (somando todas as criptomoedas). Pague via DARF (código 4600) até o último dia útil do mês seguinte.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Quanto Alocar?">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Não existe uma regra universal — depende do perfil, horizonte e objetivos. Uma referência comum entre alocadores:
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Conservador</p>
            <p className="text-muted-foreground">5-10% em ouro, 0-2% em BTC. Foco em proteção sem muita volatilidade.</p>
          </Card>
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Moderado</p>
            <p className="text-muted-foreground">5-10% em ouro, 2-5% em BTC. Aceita mais volatilidade por maior potencial de valorização.</p>
          </Card>
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Arrojado</p>
            <p className="text-muted-foreground">5% em ouro, 5-10% em BTC. Alta convicção em cripto, aceita drawdowns severos.</p>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground">
          O importante é nunca alocar em Bitcoin um valor que você não aceite perder 80% temporariamente. Em 2022, BTC caiu de US$ 69k para US$ 16k — quem não aguentou psicologicamente vendeu no fundo.
        </p>
      </Card>
    </Section>
  </div>
)
