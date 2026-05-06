import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Section } from './shared'

export const Fundamentos = () => (
  <div className="space-y-8">
    <Section title="Ativos vs Passivos — Por que os Ricos Ficam Mais Ricos?">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          A diferença entre quem acumula riqueza e quem não acumula é simples: <strong className="text-foreground">ricos compram ativos, pobres compram passivos.</strong>
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Card className="p-3 space-y-2 bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Ativo</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Qualquer coisa que, mesmo tendo custos, <strong>gera renda</strong> e coloca dinheiro no seu bolso. Exemplos: ações, FIIs, imóveis alugados, negócios, títulos de renda fixa.
            </p>
          </Card>
          <Card className="p-3 space-y-2 bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Passivo</p>
            <p className="text-sm text-red-700 dark:text-red-400">
              Qualquer coisa que <strong>não gera valor</strong>, mas que lhe custa. Exemplos: carro financiado que não gera renda, dívidas de cartão, assinaturas que não usa.
            </p>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Todo dinheiro do mundo, se não for convertido em ativos, pode desaparecer. É improvável viver sem nenhum passivo — o importante é que os passivos valham o custo, e que sua coluna de ativos cresça consistentemente.
        </p>
        <div className="bg-muted rounded p-3 text-sm text-muted-foreground italic border-l-2 border-primary">
          "Os pobres trabalham para conseguir dinheiro e os ricos fazem o dinheiro trabalhar por eles." — Robert Kiyosaki
        </div>
      </Card>
    </Section>

    <Section title="Juros Compostos — A Oitava Maravilha do Mundo">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Einstein teria dito: <em>"Juros compostos são a oitava maravilha do mundo. Aquele que entende, ganha. Aquele que não entende, paga."</em>
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Juros Simples</p>
            <p className="text-sm text-muted-foreground">O percentual incide sempre sobre o valor inicial. R$ 100 a 10% ao mês: ao final de 12 meses, R$ 220 (R$ 120 de juros + R$ 100 original).</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Juros Compostos</p>
            <p className="text-sm text-muted-foreground">O percentual incide sobre o valor acumulado. R$ 100 a 10% ao mês: ao final de 12 meses, R$ 313,78 — 43% a mais que os juros simples.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="py-1 px-2 text-muted-foreground font-medium border border-border">Mês</th>
                <th className="py-1 px-2 text-muted-foreground font-medium border border-border">Juros Simples</th>
                <th className="py-1 px-2 text-muted-foreground font-medium border border-border">Juros Compostos</th>
              </tr>
            </thead>
            <tbody>
              {[
                [0, 'R$ 100', 'R$ 100'],
                [3, 'R$ 130', 'R$ 133,10'],
                [6, 'R$ 160', 'R$ 177,15'],
                [9, 'R$ 190', 'R$ 235,79'],
                [12, 'R$ 220', 'R$ 313,78'],
              ].map(([mes, simples, compostos]) => (
                <tr key={mes} className="border-b border-border">
                  <td className="py-1 px-2 border border-border text-muted-foreground">{mes}</td>
                  <td className="py-1 px-2 border border-border text-muted-foreground">{simples}</td>
                  <td className="py-1 px-2 border border-border text-primary font-medium">{compostos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">O maior fator dos juros compostos é o tempo.</strong> Quanto mais cedo você começa a investir, mais poderoso é o efeito. Todos os investimentos da bolsa de valores são calculados com juros compostos.
        </p>
      </Card>
    </Section>

    <Section title="O que é Liberdade Financeira?">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Liberdade financeira não é ganhar muito, tampouco ter muitos passivos. Em síntese, é <strong className="text-foreground">ter o poder de escolher</strong> — optar por definir qual padrão de vida se deseja obter. Você a atinge quando sua renda passiva (gerada pelos ativos) supera seus gastos mensais.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Passo 1</p>
            <p className="text-muted-foreground">Conheça seus ativos e passivos. Monte uma planilha e saiba exatamente seu patrimônio líquido hoje.</p>
          </Card>
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Passo 2</p>
            <p className="text-muted-foreground">Diminua passivos desnecessários e aumente aportes mensais em ativos geradores de renda.</p>
          </Card>
          <Card className="p-3 space-y-1">
            <p className="font-medium text-foreground">Passo 3</p>
            <p className="text-muted-foreground">Reinvista os rendimentos dos ativos para acelerar os juros compostos. O tempo faz o resto.</p>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground">
          Liberdade não é viver como eremita nem gastar sem planejamento. É o equilíbrio entre construir o futuro e aproveitar o presente — "metade droga e metade salada".
        </p>
      </Card>
    </Section>

    <Section title="Como Identificar Golpes Financeiros">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Todo investimento envolve três variáveis que <strong className="text-foreground">nunca coexistem no máximo ao mesmo tempo</strong>:
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: 'Rentabilidade', desc: 'Quanto o investimento rende. Quanto maior, maior o risco envolvido.', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300' },
            { label: 'Liquidez', desc: 'Facilidade de resgatar o dinheiro quando quiser. Alta liquidez geralmente reduz rentabilidade.', color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300' },
            { label: 'Segurança', desc: 'Baixo risco de perda. Maior segurança = menor rentabilidade potencial.', color: 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300' },
          ].map((item) => (
            <Card key={item.label} className={`p-3 space-y-1 ${item.color}`}>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-sm opacity-90">{item.desc}</p>
            </Card>
          ))}
        </div>
        <Card className="p-3 bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-700">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">Regra de ouro para identificar golpes:</p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            Qualquer proposta que ofereça <strong>alta rentabilidade + alta liquidez + sem risco</strong> ao mesmo tempo é mentira. É impossível ter grande lucro, com resgate imediato e garantia de não perder. Se parecer bom demais para ser verdade, é porque é.
          </p>
        </Card>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Exemplos reais por tipo:</p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {[
              { tipo: 'Renda Fixa', desc: 'Alta segurança + liquidez razoável, mas rentabilidade menor. Legítimo.', ok: true },
              { tipo: 'Ações', desc: 'Alta liquidez + potencial de alta rentabilidade, mas com risco real. Legítimo.', ok: true },
              { tipo: 'Esquema Ponzi', desc: '"20% ao mês garantido, sem risco, saque quando quiser." Golpe.', ok: false },
              { tipo: 'Pirâmide', desc: 'Retorno depende de recrutar outros. Insustentável matematicamente. Golpe.', ok: false },
            ].map((item) => (
              <div key={item.tipo} className={`rounded px-3 py-2 flex gap-2 ${item.ok ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                <span className={`shrink-0 font-medium text-xs ${item.ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{item.tipo}</span>
                <span className="text-xs text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Section>

    <Section title="Crenças Limitantes sobre Dinheiro">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Crenças negativas sobre dinheiro se tornam obstáculos mentais que impedem o acúmulo de patrimônio. Identifique e desfaça os mitos mais comuns:
        </p>
        <div className="space-y-2">
          {[
            {
              mito: '"Dinheiro é a raiz de todo mal"',
              realidade: 'Os problemas vêm da falta de dinheiro, não do dinheiro em si. Se fosse ruim, seria distribuído e não perseguido.',
            },
            {
              mito: '"Ficar rico depende de sorte"',
              realidade: 'Sorte é estar no lugar certo, na hora certa, sendo a pessoa certa. Oportunidades iguais geram resultados diferentes — o êxito está no preparo e no aproveitamento.',
            },
            {
              mito: '"Dinheiro não traz felicidade"',
              realidade: 'Dinheiro compra liberdade — a única coisa que realmente vale ter. A partir da liberdade, você pode ou não adquirir o que quiser.',
            },
            {
              mito: '"Rico enriquece à custa dos pobres"',
              realidade: 'Ninguém fica rico sem criar impacto positivo na vida de muitas pessoas. Dinheiro é sempre resultado de valor gerado.',
            },
            {
              mito: '"Só ganha dinheiro quem já tem dinheiro"',
              realidade: 'Na era da informação, é possível criar riqueza com pouco capital inicial. Conhecimento e disciplina são o principal capital.',
            },
          ].map((item) => (
            <div key={item.mito} className="rounded-md border border-border p-3 space-y-1">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 line-through opacity-70">{item.mito}</p>
              <p className="text-sm text-muted-foreground">{item.realidade}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Verdadeiramente, só ganha dinheiro quem gosta de dinheiro. Crenças negativas não mudam a realidade do mercado — os fatos não se alteram com base em opiniões.
        </p>
      </Card>
    </Section>

    <Section title="Mentalidade para Investir">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Construa conhecimento real, não autoajuda</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bilionários têm em comum o hábito de ler muito — alguns mais de 50 livros por ano. Livros de finanças, ciências e conhecimentos práticos constroem raciocínio e visão de mercado. Autoajuda que promete coisas infundadas não agrega. Se não gosta de ler, comece com 20 páginas por dia — o hábito se constrói com consistência pequena.
          </p>
        </Card>
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Pare de procrastinar — construa disciplina</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Procrastinação geralmente indica desconexão com seus objetivos. Para combatê-la: (1) defina quem você quer ser no futuro; (2) identifique 3 atividades essenciais que te aproximam desse objetivo; (3) remova hábitos e compromissos que te afastam; (4) cumpra as 3 atividades essenciais todos os dias sem falhar.
          </p>
          <p className="text-sm text-muted-foreground">
            É mais fácil ampliar o tempo de uma ação pequena já estabelecida do que começar com algo impossível de cumprir. O cérebro aprende com a insistência e a organização.
          </p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Equilíbrio: "metade droga e metade salada"</p>
          <p className="text-sm text-muted-foreground">
            O objetivo não é ser o homem mais rico do cemitério. Liberdade financeira é construída enquanto se vive bem. Conheça seus prazeres, defina metas de curto e longo prazo, e invista com um propósito claro — <em>por que</em> você investe e pelo que quer ser lembrado.
          </p>
        </Card>
      </div>
    </Section>
  </div>
)
