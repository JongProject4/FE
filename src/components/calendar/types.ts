// src/components/calendar/types.ts

export type EventType = 'clinic' | 'med'

export interface ClinicRecord {
  id: string
  type: 'clinic'
  childId: string
  childName: string
  hospital: string
  diagnosis: string
  hasNextVisit: boolean
  nextVisitDate?: string      // ISO date string
  visitDate?: string          // ISO datetime: AI 등록 내원 알람의 방문 일시 (수기 입력엔 없음)
  medications: MedEntry[]
  date: string                // YYYY-MM-DD
  createdAt: string
}

export interface MedEntry {
  name: string
  startDate: string
  endDate: string
}

export interface MedRecord {
  id: string
  type: 'med'
  childId: string
  childName: string
  medName: string
  startDate: string
  endDate: string
  times: string[]             // ["08:00", "20:00"]
  dosage: string
  alarmEnabled: boolean
  date: string
  createdAt: string
}

export type CalendarEvent = ClinicRecord | MedRecord

export interface DayEvents {
  [dateKey: string]: CalendarEvent[]  // key: "YYYY-M-D"
}

export interface Child {
  id: string
  name: string
  age: string
  gender: 'MALE' | 'FEMALE'
}
