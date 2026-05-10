import { useEffect, useMemo, useState } from 'react'
import { Skeleton } from '@/components'
import { subscribeToAssets } from '@/services/assets'
import { fetchUpcomingDividends, type UpcomingDividend } from '@/services/statusinvest'
import { useAuth } from '@/store/auth'
import { generateReportEvents, type ReportEvent } from './utils/report-events'
import { CalendarGrid, DayEvents, ProvisionedList } from './components'

const today = new Date()

export const CalendarPage = () => {
  const { user } = useAuth()
  const [assets, setAssets] = useState<{ ticker: string; quantity: number; type: string }[]>([])
  const [dividends, setDividends] = useState<UpcomingDividend[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    return subscribeToAssets(user.uid, (data) => setAssets(data))
  }, [user])

  useEffect(() => {
    if (assets.length === 0) return

    const tickerQty = new Map(
      assets
        .filter((a) => a.type === 'stock' || a.type === 'fii')
        .map((a) => [a.ticker.toUpperCase(), a.quantity]),
    )
    if (tickerQty.size === 0) {
      setLoading(false)
      return
    }

    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 6, 0)

    setLoading(true)
    fetchUpcomingDividends(tickerQty, start, end)
      .then(setDividends)
      .catch(() => setDividends([]))
      .finally(() => setLoading(false))
  }, [assets])

  const reportAssets = useMemo(
    () => assets.filter((a) => a.type === 'stock' || a.type === 'fii'),
    [assets],
  )

  const reports = useMemo<ReportEvent[]>(() => {
    if (reportAssets.length === 0) return []
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 6, 0)
    return generateReportEvents(reportAssets, start, end)
  }, [reportAssets])

  const confirmedDividends = useMemo(
    () => dividends.filter((d) => d.paymentDate && !d.isProvisioned),
    [dividends],
  )

  const provisionedDividends = useMemo(
    () => dividends.filter((d) => !d.paymentDate || d.isProvisioned),
    [dividends],
  )

  const selectedDayDividends = useMemo(
    () => (selectedDay ? confirmedDividends.filter((d) => d.paymentDate === selectedDay) : []),
    [confirmedDividends, selectedDay],
  )

  const selectedDayReports = useMemo(
    () => (selectedDay ? reports.filter((r) => r.date === selectedDay) : []),
    [reports, selectedDay],
  )

  const hasSelectedEvents = selectedDayDividends.length > 0 || selectedDayReports.length > 0

  const goToPrev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
    setSelectedDay(null)
  }

  const goToNext = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
    setSelectedDay(null)
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Calendar */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-36 h-5" />
                <Skeleton className="w-8 h-8 rounded" />
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d) => (
                  <Skeleton key={d} className="h-4 w-full" />
                ))}
                {Array.from({ length: 35 }, (_, i) => String(i)).map((i) => (
                  <Skeleton key={i} className="h-13 rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <CalendarGrid
              year={year}
              month={month}
              dividends={confirmedDividends}
              reports={reports}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onPrev={goToPrev}
              onNext={goToNext}
            />
          )}

          {/* Legend */}
          {!loading && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Provento confirmado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Relatório (prazo CVM)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span>Provento a definir</span>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {selectedDay && hasSelectedEvents && (
            <DayEvents
              date={selectedDay}
              dividends={selectedDayDividends}
              reports={selectedDayReports}
            />
          )}

          {selectedDay && !hasSelectedEvents && (
            <div className="text-sm text-muted-foreground text-center py-8">
              Nenhum evento neste dia.
            </div>
          )}

          {!selectedDay && !loading && (
            <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
              Clique em um dia para ver os eventos.
            </div>
          )}

          {!loading && <ProvisionedList dividends={provisionedDividends} />}

          {!loading && (confirmedDividends.length > 0 || reports.length > 0) && (
            <div className="text-xs text-muted-foreground space-y-1 px-1">
              <div className="flex justify-between">
                <span>Proventos confirmados</span>
                <span className="font-medium text-foreground tabular-nums">
                  {confirmedDividends.length} eventos
                </span>
              </div>
              <div className="flex justify-between">
                <span>Relatórios (próx. 6m)</span>
                <span className="font-medium text-foreground tabular-nums">
                  {reports.length} eventos
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
