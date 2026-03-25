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
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
