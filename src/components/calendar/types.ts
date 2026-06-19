// src/components/calendar/types.ts

export type EventType = 'clinic' | 'med' | 'consultation'

export interface ConsultationRecord {
  id: string
  type: 'consultation'
  childId: string
  childName: string
  title: string
  category?: string
  riskLevel?: string
  chatId: number
  date: string
  createdAt: string
}

export interface ClinicRecord {
  id: string
  type: 'clinic'
  childId: string
  childName: string
  hospitalName: string
  visitDate: string
  memo: string
  isActive: boolean
  date: string
  createdAt: string
  alarmId: number
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

export type CalendarEvent = ClinicRecord | MedRecord | ConsultationRecord

export interface DayEvents {
  [dateKey: string]: CalendarEvent[]  // key: "YYYY-M-D"
}

export interface Child {
  id: string
  name: string
  age: string
  gender: 'MALE' | 'FEMALE'
}
