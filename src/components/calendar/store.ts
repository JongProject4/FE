// src/components/calendar/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CalendarEvent, DayEvents } from './types'
import { dateKey } from './utils'

interface CalendarStore {
  events: DayEvents
  addEvent: (event: CalendarEvent) => void
  removeEvent: (date: Date, eventId: string) => void
  getEventsForDate: (date: Date) => CalendarEvent[]
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: {},

      addEvent: (event) =>
        set((s) => {
          const key = event.date
          return {
            events: {
              ...s.events,
              [key]: [...(s.events[key] || []), event],
            },
          }
        }),

      removeEvent: (date, eventId) =>
        set((s) => {
          const key = dateKey(date)
          return {
            events: {
              ...s.events,
              [key]: (s.events[key] || []).filter((e) => e.id !== eventId),
            },
          }
        }),

      getEventsForDate: (date) => {
        const key = dateKey(date)
        return get().events[key] || []
      },
    }),
    { name: 'pediatric-calendar-events' }
  )
)
