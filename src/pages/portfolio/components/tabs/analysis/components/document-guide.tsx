import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'

const STOCK_DOCS = {
  priority: [
    { name: 'Release de Resultados', desc: 'Resumo trimestral acessível — comece aqui' },
    { name: 'DFP', desc: 'Demonstrações completas anuais — o mais importante' },
    { name: 'ITR', desc: 'Versão trimestral da DFP, acompanha tendências' },
  ],
  situational: [
    { name: 'FRE', desc: 'Governança e remuneração de executivos' },
    { name: 'Fato Relevante', desc: 'Só quando sair notícia grande (fusão, CEO, etc.)' },
    { name: 'Ata de AGO/AGE', desc: 'O que foi votado nas assembleias' },
  ],
  ignore: ['Prospecto (só em IPO)', 'Comunicado ao Mercado (burocrático)'],
  tip: 'No DFP/ITR, foca no MD&A — é onde a gestão explica os números. Transparência ou esquiva aparecem ali.',
}

const FII_DOCS = {
  priority: [
    { name: 'Relatório Gerencial', desc: 'O principal — portfólio, vacância, resultado mensal' },
    { name: 'Regulamento', desc: 'Leia uma vez — define o que o fundo pode fazer' },
    { name: 'Informe Mensal', desc: 'Dados básicos de PL e cotas (padrão CVM)' },
  ],
  situational: [
    { name: 'Fato Relevante', desc: 'Aquisição/venda de imóvel ou renegociação relevante' },
    { name: 'Laudo de Avaliação', desc: 'Pra checar se o imóvel está a preço justo' },
    { name: 'Ata de Assembleia', desc: 'Votações dos cotistas' },
  ],
  ignore: ['Informe Trimestral (o mensal já cobre)', 'Prospectos de emissão (só em ofertas)'],
  tip: 'Em FII, o que importa é vacância, contratos e distribuição — não foca em DRE igual ação.',
}

export const DocumentGuide = ({ type }: { type: 'stock' | 'fii' }) => {
  const [open, setOpen] = useState(false)
  const docs = type === 'stock' ? STOCK_DOCS : FII_DOCS

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={13} className="text-primary/70 shrink-0" />
          <span className="text-xs font-medium text-muted-foreground">
            Guia de documentos — {type === 'stock' ? 'Ações' : 'FIIs'}
          </span>
        </div>
        <ChevronDown
          size={13}
          className={`text-muted-foreground/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-4 pt-1 space-y-4 border-t border-border bg-muted/10">
          {type === 'stock' && (
            <div className="mt-2 space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Qual documento priorizar
              </p>
              {[
                { tipo: 'Empresa operacional', doc: 'Release de Resultados', reason: 'O lucro vem da operação — receita, margem, crescimento' },
                { tipo: 'Empresa regulada', doc: 'Relatório da Administração', reason: 'O lucro vem de decisões regulatórias, não do mercado' },
                { tipo: 'Holding', doc: 'Demonstrações Contábeis', reason: 'O valor vem das participações, não de operação própria' },
              ].map((row) => (
                <div key={row.tipo} className="flex gap-2 rounded-md px-2.5 py-2 bg-muted/20">
                  <div className="min-w-27.5 shrink-0">
                    <p className="text-[11px] text-muted-foreground">{row.tipo}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{row.doc}</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-snug">{row.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-widest">
                Leia sempre
              </p>
              {docs.priority.map((d) => (
                <div key={d.name} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    <span className="text-xs font-semibold text-foreground">{d.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug pl-3.5">{d.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Se precisar
                </p>
                {docs.situational.map((d) => (
                  <div key={d.name} className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      <span className="text-xs font-semibold text-foreground">{d.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug pl-3.5">
                      {d.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-destructive/70 uppercase tracking-widest">
                  Pode ignorar
                </p>
                {docs.ignore.map((d) => (
                  <div key={d} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive/30 shrink-0" />
                    <p className="text-[11px] text-muted-foreground">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md bg-primary/5 border border-primary/10 px-3 py-2">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-primary/80">Dica: </span>
              {docs.tip}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
