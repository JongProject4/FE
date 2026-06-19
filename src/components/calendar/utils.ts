// src/components/calendar/utils.ts
import { CalendarEvent } from './types'

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function formatDateLabel(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`
}

export function calcAge(birthdate: string): string {
  const b = new Date(birthdate)
  const now = new Date()
  let y = now.getFullYear() - b.getFullYear()
  let m = now.getMonth() - b.getMonth()
  if (m < 0) { y--; m += 12 }
  if (y === 0) return `${m}개월`
  return m > 0 ? `${y}세 ${m}개월` : `${y}세`
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function isToday(date: Date): boolean {
  const t = new Date()
  return date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate()
}

export function groupEventsByType(events: CalendarEvent[]) {
  return {
    clinic: events.filter(e => e.type === 'clinic'),
    med: events.filter(e => e.type === 'med'),
    consultation: events.filter(e => e.type === 'consultation'),
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** BE LocalDateTime용 — UTC 변환 없이 로컬 시각 문자열 생성 */
export function toLocalDateTimeString(date: Date, hour: number, minute: number): string {
  const y = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(Math.min(23, Math.max(0, hour))).padStart(2, '0')
  const m = String(Math.min(59, Math.max(0, minute))).padStart(2, '0')
  return `${y}-${mo}-${d}T${h}:${m}:00`
}

/** API LocalDateTime 문자열을 타임존 변환 없이 파싱 */
export function parseLocalDateTime(value: string): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
} | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!match) return null
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
    hour: parseInt(match[4], 10),
    minute: parseInt(match[5], 10),
  }
}

export function formatVisitTimeLabel(visitDate: string): string {
  const parts = parseLocalDateTime(visitDate)
  if (parts) return `${parts.hour}시 ${String(parts.minute).padStart(2, '0')}분`
  const d = new Date(visitDate)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getHours()}시 ${String(d.getMinutes()).padStart(2, '0')}분`
}

export function visitDateToDateKey(visitDate: string): string {
  const parts = parseLocalDateTime(visitDate)
  if (!parts) return ''
  return `${parts.year}-${parts.month}-${parts.day}`
}
