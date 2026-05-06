import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Section } from './shared'

const profiles = [
  {
    label: 'Extremamente Agressivo',
    color: 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    description:
      'Apetite muito grande pelo risco, controle emocional acima da média. Atenção: a maior parte dos investidores expulsos do jogo tem esse perfil.',
    allocations: [
      { label: 'Ações no Brasil', range: '10–30%' },
      { label: 'Ações no Exterior', range: '10–30%' },
      { label: 'ETFs no Exterior', range: '5–15%' },
      { label: 'FIIs ou REITs', range: '0–10%' },
      { label: 'Reserva de Valor', range: '0–10%' },
      { label: 'Reserva de Oportunidade', range: '0–10%' },
      { label: 'Renda Fixa', range: '10–25%' },
    ],
    pros: ['Grande potencial de rentabilidade', 'Flexibilidade e interesse por setores novos', 'Proteção natural via internacionalização'],
    cons: ['Excessivamente confiante', 'Suscetível a grandes perdas abruptas', 'Dificuldade em aceitar erros'],
  },
  {
    label: 'Arriscado',
    color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    description:
      'Bom controle emocional e visão realista das próprias limitações, mas em momentos de imprecisão demonstra grande vontade de tomar riscos.',
    allocations: [
      { label: 'Ações no Brasil', range: '5–20%' },
      { label: 'Ações no Exterior', range: '5–20%' },
      { label: 'ETFs no Exterior', range: '10–20%' },
      { label: 'FIIs ou REITs', range: '5–15%' },
      { label: 'Reserva de Valor', range: '5–10%' },
      { label: 'Reserva de Oportunidade', range: '0–15%' },
      { label: 'Renda Fixa', range: '20–30%' },
    ],
    pros: ['Altos ganhos no médio e longo prazo', 'Renda passiva desde o início', 'Extremamente diversificado'],
    cons: ['Corre riscos além do necessário', 'Carteira complexa de rebalancear', 'Alta exposição em renda variável'],
  },
  {
    label: 'Equilibrado',
    color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800',
    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    description:
      'Equilíbrio e ponderação desejáveis. Gosta de analisar riscos antes de agir. Renda Fixa e Variável em sintonia quase perfeita (50/50 ou 60/40).',
    allocations: [
      { label: 'Ações no Brasil', range: '5–15%' },
      { label: 'Ações no Exterior', range: '5–15%' },
      { label: 'ETFs no Exterior', range: '10–20%' },
      { label: 'FIIs ou REITs', range: '5–10%' },
      { label: 'Reserva de Valor', range: '0–5%' },
      { label: 'Reserva de Oportunidade', range: '0–5%' },
      { label: 'Renda Fixa', range: '20–30%' },
    ],
    pros: ['Sólido como uma rocha', 'Renda passiva constante', 'Fácil manutenção no longo prazo'],
    cons: ['Rigidez nem sempre é boa', 'Dificuldade de mudar de opinião', 'A constância pode ser entediante'],
  },
  {
    label: 'Conservador',
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    description:
      'Prefere sempre os menores riscos. No geral, é o perfil com maior sucesso em renda variável no longo prazo. Graham, Fisher e outros grandes nomes seguiram estratégias similares.',
    allocations: [
      { label: 'Ações perenes no Brasil', range: '10–30%' },
      { label: 'Ações no Exterior', range: '5–10%' },
      { label: 'ETFs de Renda Variável por Setor', range: '10–20%' },
      { label: 'FIIs ou REITs de baixo risco', range: '10–20%' },
      { label: 'Reserva de Valor', range: '5–10%' },
      { label: 'Criptomoedas diversas', range: '0–3%' },
      { label: 'Renda Fixa', range: '10–40%' },
      { label: 'ETFs de Renda Fixa nos EUA', range: '10–40%' },
    ],
    pros: ['Perenidade — dificilmente expulso do jogo', 'Menor oscilação e rebalanceamento', 'Geração de renda passiva forte'],
    cons: ['Lentidão pode gerar ansiedade', 'Exposição considerável ao risco para conservadores', 'Necessita aportes constantes'],
  },
  {
    label: 'Ultraconservador',
    color: 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    description:
      'Quer proteger o patrimônio enquanto tenta aumentá-lo. Alta exposição em FIIs, REITs, ouro e Renda Fixa. Ser ultraconservador não significa ganhar menos — significa proteger mais.',
    allocations: [
      { label: 'Ações perenes no Brasil', range: '5–15%' },
      { label: 'Ações no Exterior', range: '5–15%' },
      { label: 'ETFs de Renda Variável por Setor', range: '5–15%' },
      { label: 'FIIs ou REITs de baixo custo', range: '5–25%' },
      { label: 'Reserva de Valor', range: '0–15%' },
      { label: 'Criptomoedas', range: '0–1%' },
      { label: 'Renda Fixa', range: '20–50%' },
      { label: 'ETFs de Renda Fixa nos EUA', range: '20–50%' },
    ],
    pros: ['Máxima proteção patrimonial', 'Renda passiva como sobrenome', 'Facilidade de manter aportes'],
    cons: ['Rigidez pode ser limitante', 'Crescimento mais lento', 'A constância pode ser entediante'],
  },
]

const sellReasons = [
  { label: '8 balanços com prejuízo', desc: 'A partir do 4º, já interrompa os aportes. Após 8 trimestres negativos sem justificativa, é sinal de desinvestir gradualmente.' },
  { label: 'Corrupção grave ou fraude', desc: 'Indícios sérios de fraude quebram a confiança na gestão. Ação imediata é justificada.' },
  { label: 'Má gestão comprovada', desc: 'Excesso na distribuição de lucros ou decisões que deterioram sistematicamente os fundamentos.' },
  { label: 'Emergência pessoal', desc: 'Situação que não foi coberta pela reserva de emergência. Use com moderação e recomponha depois.' },
  { label: 'Hora de usufruir', desc: 'Você planejou seu patrimônio para um momento específico de liquidação e esse momento chegou.' },
]

const historicalCases = [
  { company: 'Petrobras (PETR)', result: '79×', pct: '7.820%', note: 'Sobreviveu a escândalos e corrupção colossal' },
  { company: 'Vale (VALE3)', result: '69×', pct: '6.822%', note: 'Perdas de governança e quedas abruptas' },
  { company: 'BRF (BRFS3)', result: '40×', pct: '3.946%', note: 'Reprovada em múltiplos critérios de qualidade' },
  { company: 'Cemig (CMIG4)', result: '35×', pct: '3.393%', note: 'Uma das mais mal faladas do setor elétrico' },
  { company: 'Usiminas (USIM5)', result: '8×', pct: '723%', note: 'Momentos extremamente tensos na trajetória' },
  { company: 'Eternit (ETER3)', result: '8×', pct: '731%', note: 'Fechou fábricas e minas por questões de amianto' },
  { company: 'Eletrobras (ELET3)', result: '7×', pct: '610%', note: 'Chegou a perder para a renda fixa em alguns períodos' },
]

export const GestaoCarteira = () => (
  <div className="space-y-8">
    <Section title="Diversificação — A Árvore do Cerrado">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Imagine sua carteira como uma árvore do Cerrado: não é a mais frondosa, mas é uma das mais resistentes. O motivo? A profundidade e amplitude das raízes — cada raiz é um tipo de investimento.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Brasil</p>
            {['Reserva de Emergência', 'Renda Fixa', 'Ações', 'Fundos Imobiliários (FIIs)', 'ETFs BR'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Exterior</p>
            {['ETFs no Exterior', 'Ações no Exterior', 'REITs', 'Reserva de Valor Digital', 'Reserva de Valor Física (Ouro)'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Mínimo recomendado:</strong> 7 tipos diferentes de investimento para uma carteira ser considerada diversificada. Quanto mais raízes, mais resiliente ao clima do mercado.
          </p>
        </Card>
        <p className="text-sm text-muted-foreground">
          A raiz central e mais profunda é a <strong className="text-foreground">reserva de emergência</strong> — ela deve existir antes de qualquer outro investimento. Sem ela, você não é um investidor racional.
        </p>
      </Card>
    </Section>

    <Section title="PIAR — Perfis de Risco do Investidor">
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        O PIAR (Plataforma Integrada de Avaliação de Riscos) é uma ferramenta que, com base nas suas respostas sobre situação emocional, financeira e psicológica, sugere uma alocação de ativos compatível com o seu perfil. Não substitui a análise das corretoras — é uma referência complementar.
      </p>
      <div className="space-y-4">
        {profiles.map((p) => (
          <Card key={p.label} className={`p-4 space-y-4 ${p.color}`}>
            <div className="flex items-center gap-3">
              <Badge className={p.badgeClass}>{p.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{p.description}</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Alocação sugerida</p>
                <div className="space-y-1">
                  {p.allocations.map((a) => (
                    <div key={a.label} className="flex justify-between text-xs text-muted-foreground gap-2">
                      <span>{a.label}</span>
                      <span className="font-medium text-foreground shrink-0">{a.range}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground italic">Os percentuais precisam de ajustes para totalizarem 100%.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Pontos fortes</p>
                  {p.pros.map((item) => (
                    <p key={item} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="text-green-600">+</span> {item}
                    </p>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Pontos fracos</p>
                  {p.cons.map((item) => (
                    <p key={item} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="text-red-500">−</span> {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="Corrigindo Erros da Carteira">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Carteira até R$ 20.000</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Se encontrar uma empresa ruim com posição entre R$ 300–400, venda imediatamente — abaixo de R$ 20k total não há IR a recolher na venda. Atenção: não venda no mesmo dia da compra (Day Trade tem alíquota independente do valor).
          </p>
          <p className="text-sm text-muted-foreground">
            Encare o pequeno prejuízo como pedagógico. É melhor realizá-lo agora do que segurar capital em empresa que você não acredita.
          </p>
        </Card>
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Carteira acima de R$ 20.000</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Não saia no desespero. Verifique primeiro se as <strong>proporções</strong> estão desequilibradas — corrija via novos aportes, não via vendas em massa. Ter muito em renda fixa não é risco; ter quase tudo em renda variável, sim.
          </p>
          <div className="bg-muted rounded p-3 text-sm text-muted-foreground border-l-2 border-amber-400">
            <strong className="text-foreground">Regra de ouro:</strong> se for desmontar posições, faça pouco a pouco, de forma muito lenta. Não se corrige um erro no desespero criando um erro mais fatal.
          </div>
          <p className="text-sm text-muted-foreground">
            Nunca abra uma carteira nova desconsiderando as posições que você já tem. Equilibre a partir dos erros existentes.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Quando Vender uma Ação?">
      <Card className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          A regra do sabonete: quanto mais você mexe, mais ele diminui. A venda deve ser a exceção, não a regra. Os únicos motivos válidos são:
        </p>
        <div className="space-y-2">
          {sellReasons.map((r) => (
            <div key={r.label} className="rounded-md border border-border p-3 space-y-1">
              <p className="text-sm font-medium text-foreground">{r.label}</p>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-muted rounded p-3 text-sm text-muted-foreground border-l-2 border-primary space-y-1">
          <p><strong className="text-foreground">Nunca venda por:</strong> queda de cotação, notícias negativas passageiras, redução temporária de lucro ou porque a ação subiu demais.</p>
          <p>A primeira punição para uma empresa com resultados deteriorados é <strong className="text-foreground">interromper os aportes</strong> — não vender.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Estratégia gradual de saída</p>
          <p className="text-sm text-muted-foreground">Para cada semestre com resultado ruim, realize uma venda parcial. Se a empresa ameaçar se recuperar (Turn Around), pause a saída e volte a observar.</p>
        </div>
      </Card>
    </Section>

    <Section title="O Poder de Manter — Casos Históricos">
      <Card className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Empresas polêmicas, cheias de problemas e com momentos críticos — que ainda assim multiplicaram o capital quem as manteve por 25 anos (1995–2020):
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted text-left">
                <th className="py-2 px-3 text-xs font-semibold text-muted-foreground border border-border">Empresa</th>
                <th className="py-2 px-3 text-xs font-semibold text-muted-foreground border border-border text-center">Multiplicou</th>
                <th className="py-2 px-3 text-xs font-semibold text-muted-foreground border border-border text-center">Retorno</th>
                <th className="py-2 px-3 text-xs font-semibold text-muted-foreground border border-border">Contexto</th>
              </tr>
            </thead>
            <tbody>
              {historicalCases.map((c) => (
                <tr key={c.company} className="border-b border-border">
                  <td className="py-2 px-3 border border-border text-foreground font-medium text-xs">{c.company}</td>
                  <td className="py-2 px-3 border border-border text-center text-primary font-bold text-xs">{c.result}</td>
                  <td className="py-2 px-3 border border-border text-center text-green-600 dark:text-green-400 font-medium text-xs">{c.pct}</td>
                  <td className="py-2 px-3 border border-border text-muted-foreground text-xs">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground italic">* Retorno calculado reinvestindo os dividendos. IPCA subiu ~7× no mesmo período.</p>
        <Card className="p-3 bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>WEG3:</strong> quem comprou em 2000 e vendeu com lucro de 200× em 2011 perdeu a valorização total de <strong>21.969%</strong>. R$ 10.000 se tornaram R$ 2.467.666 para quem ficou. O lucro imediato nunca permitiria reposicionamento na mesma empresa.
          </p>
        </Card>
        <Card className="p-3 bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            <strong>Magazine Luiza:</strong> chegou às beiras da ruína, quase fechou o capital — e depois de 5 anos galgou <strong>77.733%</strong> de alavancagem.
          </p>
        </Card>
      </Card>
    </Section>

    <Section title="Mentalidade do Investidor de Longo Prazo">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Controle o que está sob seu controle</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Epicteto ensinou: só podemos nos importar com o que está dentro das nossas opções de agir. A sociedade, a política, a opinião das pessoas — fora do nosso controle. Onde investir, quanto aportar, quais riscos correr — dentro do nosso controle.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded border border-border p-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">Sob seu controle</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• Onde e quanto investir</li>
                <li>• Quais riscos aceitar</li>
                <li>• Quando aportar ou pausar</li>
                <li>• Seu nível de conhecimento</li>
              </ul>
            </div>
            <div className="rounded border border-border p-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">Fora do seu controle</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• Cotações de mercado</li>
                <li>• Decisões políticas e econômicas</li>
                <li>• Crises e eventos imprevistos</li>
                <li>• Opinião de analistas</li>
              </ul>
            </div>
          </div>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Dinheiro é meio, não fim</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O dinheiro busca a liberdade — de ter ou não ter, de ir ou não ir, de dizer sim ou não. É muito mais valioso ser livre do que ser rico. Se o dinheiro te escraviza, ele não serve. Acumule, mas se programe para desfrutar em vida.
          </p>
          <div className="bg-muted rounded p-3 text-sm text-muted-foreground italic border-l-2 border-primary">
            "Não seja o homem mais rico do cemitério."
          </div>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Erros constroem patrimônio tanto quanto acertos</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Empresas vão falir, outras vão prosperar centenas de vezes, outras vão empatar. Ninguém é invicto. O investidor de longo prazo tem a vantagem de poder errar muitas vezes — desde que acerte uma. A estratégia deve ser pessoal, mas a recomendação mais sensata é pecar pela paciência e equilíbrio.
          </p>
        </Card>
      </div>
    </Section>
  </div>
)
