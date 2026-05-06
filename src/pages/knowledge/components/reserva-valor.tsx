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
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Por que descorrelação importa</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ouro e Bitcoin têm baixa correlação com ações e renda fixa — quando a bolsa despenca, eles tendem a se mover de forma independente (ou até subir). Isso reduz a volatilidade total da carteira sem necessariamente reduzir o retorno. É o princípio da diversificação real: não basta ter muitos ativos, é preciso que eles se movam de formas diferentes.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Para o brasileiro:</strong> tanto ouro quanto Bitcoin são cotados em dólar. Isso adiciona proteção cambial — se o real desvalorizar (o que acontece historicamente), esses ativos sobem em reais mesmo que o preço em dólar não mude. É um hedge natural contra a fragilidade do BRL.
        </p>
      </Card>
    </Section>

    <Section title="Ouro — O Ativo Milenar">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            O ouro é reconhecido como reserva de valor há mais de 5.000 anos. Sua oferta é limitada
            fisicamente — não pode ser criado por governos ou bancos centrais. Por isso, tende a se
            valorizar em termos de moeda quando há inflação ou crise de confiança nas instituições.
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
                name: 'OZ1D / OZ2D / OZ3D (contratos futuros)',
                desc: 'Contratos de ouro negociados na B3 em grama com diferentes vencimentos (D = dias corridos). Mais complexo, exige conta habilitada para derivativos. Adequado para investidores avançados que querem exposição direta sem câmbio.',
                badge: 'Avançado',
              },
              {
                name: 'Fundos de ouro',
                desc: 'Fundos geridos que investem em ouro. Atenção: sofrem Come-Cotas (IR antecipado em maio e novembro), diferente do GOLD11 ETF que tributa apenas no resgate. Têm taxa de administração. Na maioria dos casos, o ETF é mais eficiente.',
                badge: 'Verificar Come-Cotas',
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
                  <Badge variant="outline" className="text-xs">
                    {item.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Tributação do Ouro</p>
          <p className="text-sm text-muted-foreground">
            Ouro físico e contratos OZ1D: ganho de capital tributado como renda variável — 15% para
            Swing Trade, 20% para Day Trade. GOLD11 (ETF): 15% sobre o ganho na venda, sem isenção
            de R$ 20k.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Bitcoin — Aspirante a Reserva de Valor">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bitcoin foi criado em 2009 como sistema de pagamento descentralizado e passou a ser cogitado como reserva de valor — especialmente em países com instabilidade monetária. Sua oferta é limitada matematicamente a 21 milhões de unidades.
          </p>
          <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded">
            <strong>Importante:</strong> Bitcoin ainda é um <strong>aspirante</strong> à reserva de valor — não uma reserva confirmada. O ouro tem milênios de track record. O Bitcoin tem ~15 anos e volatilidade extrema. A narrativa de "ouro digital" é promissora, mas ainda não está provada. Invista sabendo disso.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A narrativa de "ouro digital" ganha força: assim como o ouro, o Bitcoin não tem contraparte central, não pode ser confiscado digitalmente se armazenado corretamente, e sua escassez é algorítmica, não física.
          </p>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Blockchain — O Porquê da Descentralização</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Bitcoin funciona sobre uma <strong className="text-foreground">blockchain</strong>: um banco de dados distribuído onde cada transação é registrada em blocos encadeados criptograficamente. Milhares de computadores ao redor do mundo guardam uma cópia idêntica desse histórico — nenhum deles sozinho pode alterar ou apagar registros.
          </p>
          <div className="grid sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-muted rounded p-2 space-y-1">
              <p className="font-medium text-foreground">Descentralizado</p>
              <p className="text-muted-foreground">Não há servidor central. Para "hackear", precisaria controlar mais de 50% dos computadores da rede simultaneamente — computacionalmente inviável.</p>
            </div>
            <div className="bg-muted rounded p-2 space-y-1">
              <p className="font-medium text-foreground">Imutável</p>
              <p className="text-muted-foreground">Uma vez registrada, a transação não pode ser alterada ou desfeita. Cada bloco contém o hash do bloco anterior — alterar um mudaria todos os seguintes.</p>
            </div>
            <div className="bg-muted rounded p-2 space-y-1">
              <p className="font-medium text-foreground">Transparente</p>
              <p className="text-muted-foreground">Qualquer pessoa pode verificar qualquer transação em tempo real. As carteiras são pseudônimas (endereço público), não anônimas.</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Chave privada (seed phrase):</strong> quem controla as chaves privadas controla os Bitcoin. A seed phrase é uma sequência de 12-24 palavras que reconstitui sua carteira. Se perder — os BTC somem para sempre. Se alguém roubar — os BTC vão embora. Nunca compartilhe, nunca armazene digitalmente sem criptografia.
          </p>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Ciclos de Alta e Baixa</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Bitcoin historicamente se move em ciclos de ~4 anos ligados ao halving. Cada ciclo tem uma fase de acumulação, uma alta agressiva (bull market), um topo especulativo e uma queda severa (bear market).
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {[
              { ciclo: '2013', topo: '~US$ 1.200', queda: '−87%' },
              { ciclo: '2017', topo: '~US$ 20.000', queda: '−84%' },
              { ciclo: '2021', topo: '~US$ 69.000', queda: '−77%' },
              { ciclo: '2025?', topo: 'Em andamento', queda: 'A definir' },
            ].map((c) => (
              <div key={c.ciclo} className="bg-muted rounded px-3 py-2 flex justify-between">
                <span className="font-medium text-foreground">{c.ciclo}</span>
                <span className="text-muted-foreground">Topo: {c.topo}</span>
                <span className="text-destructive">{c.queda}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Quedas de 75-87% são normais no histórico do Bitcoin. Quem comprou no topo do ciclo de 2017 esperou 3-4 anos para voltar ao lucro. <strong className="text-foreground">Só invista o que você pode deixar parado por um ciclo completo.</strong>
          </p>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Hot Wallet vs Cold Wallet</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Hot Wallet (quente)</p>
              <p className="text-sm text-muted-foreground">Conectada à internet. Inclui exchanges (Binance, Mercado Bitcoin) e apps de carteira digital. Conveniente para uso diário e trading. Risco: hack, falência da exchange (ex: FTX em 2022 — clientes perderam fundos). Regra: não deixe mais do que aceita perder numa exchange.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Cold Wallet (fria)</p>
              <p className="text-sm text-muted-foreground">Offline. Hardware wallets (Ledger, Trezor) armazenam as chaves privadas sem conexão à internet. Imune a hacks remotos. Risco: perda física do dispositivo ou da seed phrase. Para valores significativos, é o padrão de segurança recomendado.</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Estratégia prática:</strong> guarde o essencial em cold wallet, mantenha apenas o que vai operar em hot wallet. A seed phrase da cold wallet deve estar escrita em papel (ou gravada em metal) guardada em local seguro — nunca em foto ou arquivo digital.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Halving — A Escassez Programada</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A cada ~4 anos (210.000 blocos minerados), a recompensa dos mineradores é cortada pela metade — isso se chama <strong className="text-foreground">halving</strong>. Em 2009, a recompensa era 50 BTC por bloco. Em 2024, caiu para 3,125 BTC. Por volta de 2140, o último Bitcoin será emitido.
          </p>
          <p className="text-sm text-muted-foreground">
            O halving reduz a emissão nova de Bitcoin de forma previsível e transparente — ao contrário de governos que podem imprimir moeda sem aviso. Historicamente, os halvings precederam ciclos de alta significativos, mas passado não garante futuro.
          </p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="p-3 bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800 space-y-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Argumentos a favor
            </p>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>• Oferta máxima de 21M de unidades (escassez real)</li>
              <li>• Descentralizado — nenhum governo controla</li>
              <li>• Portabilidade superior ao ouro físico</li>
              <li>• Adoção institucional crescente (ETFs de BTC)</li>
              <li>• 15 anos sem falhas de protocolo</li>
            </ul>
          </Card>
          <Card className="p-3 bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 space-y-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Riscos e limitações
            </p>
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
          <p className="text-sm font-semibold text-foreground">
            Como investir em Bitcoin no Brasil
          </p>
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
                  <Badge variant="outline" className="text-xs shrink-0">
                    {item.badge}
                  </Badge>
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
            Isenção para vendas mensais abaixo de R$ 35.000 (somando todas as criptomoedas). Pague
            via DARF (código 4600) até o último dia útil do mês seguinte.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Outros Ativos — Prata e Dólar">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Prata (Silver)</p>
            <Badge variant="outline" className="text-xs">Use com cautela</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A prata tem propriedades similares ao ouro como metal precioso, mas <strong className="text-foreground">não funciona igualmente como reserva de valor</strong>. O motivo: ~55% da demanda por prata é industrial (eletrônica, painéis solares, medicina). Isso a torna um híbrido entre commodity industrial e reserva de valor — mais volátil e menos previsível.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Cai mais que o ouro em crises (demanda industrial cai junto)</li>
            <li>• Pode subir mais em expansões econômicas (demanda industrial cresce)</li>
            <li>• Spread de compra/venda mais alto que o ouro físico</li>
            <li>• No Brasil: pouca opção de ETF direto em prata</li>
          </ul>
          <p className="text-xs text-muted-foreground italic">Conclusão: se o objetivo é reserva de valor, ouro é mais adequado. Prata pode complementar como especulação em commodities, não como proteção patrimonial.</p>
        </Card>
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Dólar como Hedge Cambial</p>
            <Badge variant="outline" className="text-xs">Proteção do BRL</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para o brasileiro, ter parte do patrimônio em dólar é uma forma direta de se proteger da desvalorização histórica do real. O BRL perdeu mais de 80% do valor frente ao USD nos últimos 20 anos.
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><strong className="text-foreground">Conta internacional (Wise, Nomad, Avenue):</strong> guarda dólares reais, rende juros em USD, acessa investimentos americanos diretamente.</p>
            <p><strong className="text-foreground">IVVB11 / BDRs:</strong> exposição ao dólar indiretamente via ativos americanos dentro da B3.</p>
            <p><strong className="text-foreground">GOLD11:</strong> além do ouro em si, tem exposição dupla — ouro + dólar. Dois hedges num só ativo.</p>
          </div>
          <p className="text-xs text-muted-foreground italic">Ter 15-20% do patrimônio em ativos dolarizados (ouro, BTC, ações internacionais) é uma alocação razoável para mitigar o risco cambial brasileiro.</p>
        </Card>
      </div>
    </Section>

    <Section title="Quanto Alocar?">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Não existe uma regra universal — depende do perfil, horizonte e objetivos. Uma referência
          comum entre alocadores:
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Conservador</p>
            <p className="text-muted-foreground">
              5-10% em ouro, 0-2% em BTC. Foco em proteção sem muita volatilidade.
            </p>
          </Card>
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Moderado</p>
            <p className="text-muted-foreground">
              5-10% em ouro, 2-5% em BTC. Aceita mais volatilidade por maior potencial de
              valorização.
            </p>
          </Card>
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Arrojado</p>
            <p className="text-muted-foreground">
              5% em ouro, 5-10% em BTC. Alta convicção em cripto, aceita drawdowns severos.
            </p>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground">
          O importante é nunca alocar em Bitcoin um valor que você não aceite perder 80%
          temporariamente. Em 2022, BTC caiu de US$ 69k para US$ 16k — quem não aguentou
          psicologicamente vendeu no fundo.
        </p>
      </Card>
    </Section>
  </div>
)
