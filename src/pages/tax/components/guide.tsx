import { AlertCircle } from 'lucide-react'

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-card p-5 space-y-3">
    <h3 className="font-semibold text-foreground text-sm">{title}</h3>
    <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
  </div>
)

const Tag = ({
  children,
  color = 'default',
}: {
  children: React.ReactNode
  color?: 'success' | 'destructive' | 'warning' | 'default'
}) => {
  const colors = {
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    default: 'bg-muted text-foreground',
  }
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {children}
    </span>
  )
}

const Row = ({
  label,
  value,
  tag,
  className = '',
}: {
  label: string
  value: string
  tag?: React.ReactNode
  className?: string
}) => (
  <div
    className={`flex items-start justify-between gap-4 py-2 border-b border-border/50 ${className}`}
  >
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2 text-right">
      {tag}
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  </div>
)

export const GuideSection = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoCard title="Renda Variável">
        <Row
          label="Ações — vendas ≤ R$20k/mês"
          value="Isento"
          tag={<Tag color="success">Isento</Tag>}
        />
        <Row
          label="Ações — vendas > R$20k/mês"
          value="15% sobre o lucro"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <Row
          label="Day trade (ações)"
          value="20% sobre o lucro"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <Row
          label="FIIs — qualquer venda com lucro"
          value="20% — sem isenção"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <Row
          label="FIIs — rendimentos mensais"
          value="Isento para PF"
          tag={<Tag color="success">Isento</Tag>}
        />
        <Row
          label="ETFs BR"
          value="15% — sem isenção de R$20k"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <p className="text-xs pt-1">
          Pagamento via <span className="font-medium text-foreground">DARF</span> até o último dia
          útil do mês seguinte à venda. Prejuízo pode ser compensado nos meses seguintes.
        </p>
      </InfoCard>

      <InfoCard title="Renda Fixa">
        <Row label="LCI / LCA" value="Isento para PF" tag={<Tag color="success">Isento</Tag>} />
        <Row label="CDB — até 6 meses" value="22,5%" tag={<Tag color="destructive">Fonte</Tag>} />
        <Row label="CDB — 6 a 12 meses" value="20%" tag={<Tag color="destructive">Fonte</Tag>} />
        <Row label="CDB — 12 a 24 meses" value="17,5%" tag={<Tag color="destructive">Fonte</Tag>} />
        <Row
          label="CDB — acima de 24 meses"
          value="15%"
          tag={<Tag color="destructive">Fonte</Tag>}
        />
        <Row
          label="Tesouro Direto"
          value="Mesmo regime do CDB"
          tag={<Tag color="destructive">Fonte</Tag>}
        />
        <p className="text-xs pt-1">
          IR retido <span className="font-medium text-foreground">automaticamente na fonte</span>{' '}
          pelo banco/corretora. Não exige DARF ou lançamento manual.
        </p>
      </InfoCard>

      <InfoCard title="Ativos do Exterior">
        <Row
          label="BDRs — vendas ≤ R$20k/mês"
          value="Isento"
          tag={<Tag color="success">Isento</Tag>}
        />
        <Row
          label="BDRs — vendas > R$20k/mês"
          value="15% sobre o lucro"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <Row
          label="Ações/ETFs EUA — ganho de capital"
          value="15% flat — declaração anual"
          tag={<Tag color="destructive">Anual</Tag>}
        />
        <Row
          label="Dividendos do exterior"
          value="15% flat — declaração anual"
          tag={<Tag color="destructive">Anual</Tag>}
        />
        <p className="text-xs pt-1">
          Desde a <span className="font-medium text-foreground">Lei 14.754/2023</span> (em vigor
          desde 01/01/2024), dividendos e ganhos do exterior são tributados à alíquota{' '}
          <span className="font-medium text-foreground">flat de 15%</span>, declarados{' '}
          <span className="font-medium text-foreground">uma vez por ano</span> na DAA — sem mais
          carnê-leão mensal. O IR retido no exterior (ex: 30% de withholding tax dos EUA) pode ser
          compensado, e como 30% &gt; 15%, na prática quem investe em ações/ETFs americanos{' '}
          <span className="font-medium text-foreground">não deve IR adicional ao Brasil</span>.
        </p>
      </InfoCard>

      <InfoCard title="JCP — Juros sobre Capital Próprio">
        <p>
          Forma de distribuição de lucros usada por empresas brasileiras (especialmente bancos).
          Diferente dos dividendos, o JCP é{' '}
          <span className="font-medium text-foreground">
            dedutível do lucro tributável da empresa
          </span>
          , o que reduz o IRPJ/CSLL dela — mas quem paga o imposto é o acionista.
        </p>
        <Row
          label="IR retido na fonte"
          value="15% sobre o valor bruto"
          tag={<Tag color="destructive">Fonte</Tag>}
        />
        <p className="text-xs">
          Você recebe o valor já descontado. Não exige DARF ou ação adicional — mas deve ser
          declarado na ficha de{' '}
          <span className="font-medium text-foreground">
            Rendimentos Sujeitos à Tributação Exclusiva
          </span>
          .
        </p>
      </InfoCard>

      <InfoCard title="Dividendos de Empresas BR — novidade 2026">
        <p>
          A <span className="font-medium text-foreground">Lei 15.270/2025</span> (vigente desde
          01/01/2026) reintroduziu a tributação de dividendos pagos por empresas brasileiras.
        </p>
        <Row
          label="Dividendos ≤ R$50.000/mês"
          value="Isento"
          tag={<Tag color="success">Isento</Tag>}
        />
        <Row
          label="Dividendos > R$50.000/mês"
          value="10% IRRF sobre o excedente"
          tag={<Tag color="destructive">Fonte</Tag>}
        />
        <p className="text-xs pt-1">
          Para a maioria dos investidores pessoa física com carteira de ações e FIIs, o limite de
          R$50k/mês é muito acima do recebido — na prática os dividendos continuam{' '}
          <span className="font-medium text-foreground">isentos</span>. Lucros apurados até
          31/12/2025 e formalizados até essa data seguem a regra antiga (isenção total) mesmo que
          pagos após 2026.
        </p>
      </InfoCard>

      <InfoCard title="Carnê-leão — o que é e quando usar">
        <p>
          Sistema da Receita Federal para recolher IR sobre rendimentos que{' '}
          <span className="font-medium text-foreground">não têm retenção automática na fonte</span>.
          O nome vem da ideia de que o Leão vai "comer" direto de você, sem intermediário.{' '}
          <span className="font-medium text-foreground">
            Desde 2024, dividendos do exterior não usam mais o carnê-leão
          </span>{' '}
          — passaram para declaração anual pela Lei 14.754/2023.
        </p>
        <div className="pt-1">
          <Row
            label="Aluguéis recebidos"
            value="Obrigatório"
            tag={<Tag color="warning">Mensal</Tag>}
          />
          <Row
            label="Freelancer (PF para PF)"
            value="Obrigatório"
            tag={<Tag color="warning">Mensal</Tag>}
          />
          <Row
            label="Pensão alimentícia"
            value="Obrigatório"
            tag={<Tag color="warning">Mensal</Tag>}
          />
        </div>
        <div className="bg-muted/50 rounded-md p-3 mt-2 space-y-1">
          <p className="text-xs font-medium text-foreground">Tabela progressiva 2025</p>
          <div className="grid grid-cols-2 gap-x-6 text-xs">
            <span>Até R$2.259/mês</span>
            <span className="text-success font-medium">Isento</span>
            <span>R$2.259 – R$2.826</span>
            <span className="font-medium">7,5%</span>
            <span>R$2.826 – R$3.751</span>
            <span className="font-medium">15%</span>
            <span>R$3.751 – R$4.664</span>
            <span className="font-medium">22,5%</span>
            <span>Acima de R$4.664</span>
            <span className="font-medium">27,5%</span>
          </div>
        </div>
        <p className="text-xs">
          Acesse o{' '}
          <a
            href="https://www3.cav.receita.fazenda.gov.br/carneleao/demonstrativo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          >
            Carnê-leão Web
          </a>{' '}
          no site da Receita, lance os rendimentos do mês, gere e pague o DARF até o último dia útil
          do mês seguinte. No fim do ano, os lançamentos são importados automaticamente para a
          declaração anual.
        </p>
      </InfoCard>
    </div>

    <InfoCard title="O que acontece se não declarar?">
      <div className="flex items-start gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20">
        <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
        <div className="space-y-1.5 text-sm">
          <p>
            <span className="font-medium text-foreground">Multa de 75% a 150%</span> sobre o imposto
            devido, mais juros Selic.
          </p>
          <p>
            <span className="font-medium text-foreground">Sonegação fiscal</span> em casos graves —
            crime com pena de 2 a 5 anos de reclusão.
          </p>
          <p>
            A Receita{' '}
            <span className="font-medium text-foreground">cruza dados automaticamente</span> com B3,
            bancos e corretoras — a chance de ser identificado é alta.
          </p>
        </div>
      </div>
    </InfoCard>
  </div>
)
