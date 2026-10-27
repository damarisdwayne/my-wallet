import { Zap } from 'lucide-react'
import { useAutoAlertSettings } from '@/hooks/use-auto-alert-settings'
import { requestBrowserPermission } from '@/lib/alert-delivery'
import { useAuth } from '@/store/auth'
import type { AutoAlertSettings } from '@/types'
import { AutoAlertRow } from './auto-alert-row'

export const AutoAlertsSettings = () => {
  const { user } = useAuth()
  const { settings, save } = useAutoAlertSettings(user?.uid ?? null)

  const update = (patch: Partial<AutoAlertSettings>) => {
    void requestBrowserPermission()
    void save({ ...settings, ...patch })
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        <Zap size={12} /> Alertas automáticos da carteira
      </p>
      <div className="divide-y divide-border">
        <AutoAlertRow
          label="Queda forte no dia"
          description="Ativo caiu mais que isso desde o último fechamento"
          enabled={settings.dailyDrop.enabled}
          onToggle={(enabled) => update({ dailyDrop: { ...settings.dailyDrop, enabled } })}
          pct={settings.dailyDrop.pct}
          onPctChange={(pct) => update({ dailyDrop: { ...settings.dailyDrop, pct } })}
        />
        <AutoAlertRow
          label="Queda forte na semana"
          description="Ativo caiu mais que isso em 7 dias"
          enabled={settings.weeklyDrop.enabled}
          onToggle={(enabled) => update({ weeklyDrop: { ...settings.weeklyDrop, enabled } })}
          pct={settings.weeklyDrop.pct}
          onPctChange={(pct) => update({ weeklyDrop: { ...settings.weeklyDrop, pct } })}
        />
        <AutoAlertRow
          label="Abaixo do preço médio"
          description="Preço atual ficou abaixo do seu PM"
          enabled={settings.belowAvg.enabled}
          onToggle={(enabled) => update({ belowAvg: { enabled } })}
        />
        <AutoAlertRow
          label="Enviar também por e-mail"
          description="Um resumo por tipo de alerta"
          enabled={settings.email}
          onToggle={(email) => update({ email })}
        />
      </div>
      <p className="pt-2 text-[11px] text-muted-foreground/70">
        Checado sempre que os preços são atualizados com o app aberto.
      </p>
    </div>
  )
}
