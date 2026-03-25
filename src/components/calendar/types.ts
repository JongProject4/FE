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
