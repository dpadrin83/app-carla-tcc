'use client'

import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { EnrichedEvent } from '@/lib/google/events'

type Props = {
  view: 'week' | 'month'
  events: EnrichedEvent[]
  selectedId: string | null
  onSelect: (ev: EnrichedEvent) => void
}

function eventsForDay(events: EnrichedEvent[], day: Date) {
  return events.filter((ev) => isSameDay(new Date(ev.start), day))
}

export function CalendarGrid({ view, events, selectedId, onSelect }: Props) {
  const now = new Date()

  if (view === 'week') {
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const days = eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 6),
    })

    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2"
        role="grid"
        aria-label="Calendário semanal"
      >
        {days.map((day) => {
          const dayEvents = eventsForDay(events, day)
          return (
            <div
              key={day.toISOString()}
              role="gridcell"
              className={cn(
                'min-h-[140px] rounded-xl border bg-card p-2 flex flex-col',
                isToday(day) && 'border-primary ring-1 ring-primary/20'
              )}
            >
              <p
                className={cn(
                  'text-xs font-medium mb-2 px-1',
                  isToday(day) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {format(day, 'EEE d', { locale: ptBR })}
              </p>
              <div className="space-y-1 flex-1">
                {dayEvents.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground px-1">—</p>
                ) : (
                  dayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => onSelect(ev)}
                      className={cn(
                        'w-full text-left text-[11px] leading-tight rounded-md px-1.5 py-1 border transition-colors',
                        selectedId === ev.id
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent bg-muted/60 hover:bg-muted'
                      )}
                    >
                      <span className="font-medium block">
                        {format(new Date(ev.start), 'HH:mm')}
                      </span>
                      <span className="line-clamp-2">{ev.summary}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const monthStart = startOfMonth(now)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(now), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <div role="grid" aria-label="Calendário mensal">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayEvents = eventsForDay(events, day)
          const inMonth = isSameMonth(day, now)
          return (
            <div
              key={day.toISOString()}
              role="gridcell"
              className={cn(
                'min-h-[72px] rounded-lg border p-1 text-left',
                inMonth ? 'bg-card' : 'bg-muted/30 opacity-60',
                isToday(day) && inMonth && 'border-primary ring-1 ring-primary/20'
              )}
            >
              <p
                className={cn(
                  'text-[10px] font-medium mb-0.5',
                  isToday(day) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {format(day, 'd')}
              </p>
              {dayEvents.slice(0, 2).map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelect(ev)}
                  className={cn(
                    'w-full truncate text-[9px] rounded px-0.5 py-0.5 mb-0.5',
                    selectedId === ev.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                  title={ev.summary}
                >
                  {format(new Date(ev.start), 'HH:mm')} {ev.summary}
                </button>
              ))}
              {dayEvents.length > 2 && (
                <p className="text-[9px] text-muted-foreground">+{dayEvents.length - 2}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
