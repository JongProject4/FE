import { getHospitalAlarms, type HospitalAlarmResponse } from '@/lib/api'
import type { Child, ClinicRecord, DayEvents } from '@/components/calendar/types'
import { visitDateToDateKey } from '@/components/calendar/utils'

function toClinicRecord(alarm: HospitalAlarmResponse, childName: string): ClinicRecord | null {
    const key = visitDateToDateKey(alarm.visitDate)
    if (!key) return null

    return {
        id: `hospital-${alarm.id}`,
        type: 'clinic',
        childId: String(alarm.childId),
        childName,
        hospitalName: alarm.hospitalName,
        visitDate: alarm.visitDate,
        memo: alarm.memo ?? '',
        isActive: alarm.isActive,
        date: key,
        createdAt: alarm.visitDate,
        alarmId: alarm.id,
    }
}

export function stripHospitalEvents(events: DayEvents): DayEvents {
    const result: DayEvents = {}
    for (const [key, list] of Object.entries(events)) {
        const filtered = list.filter((e) => e.type !== 'clinic')
        if (filtered.length > 0) result[key] = filtered
    }
    return result
}

export function stripMedEvents(events: DayEvents): DayEvents {
    const result: DayEvents = {}
    for (const [key, list] of Object.entries(events)) {
        const filtered = list.filter((e) => e.type !== 'med')
        if (filtered.length > 0) result[key] = filtered
    }
    return result
}

export function mergeHospitalEvents(prev: DayEvents, hospitalEvents: DayEvents): DayEvents {
    const merged = stripHospitalEvents(prev)
    for (const [key, list] of Object.entries(hospitalEvents)) {
        merged[key] = [...(merged[key] || []), ...list]
    }
    return merged
}

export async function fetchHospitalCalendarEvents(children: Child[]): Promise<DayEvents> {
    const events: DayEvents = {}

    for (const child of children) {
        try {
            const alarms = await getHospitalAlarms(Number(child.id))
            for (const alarm of alarms) {
                const record = toClinicRecord(alarm, child.name)
                if (!record) continue
                if (!events[record.date]) events[record.date] = []
                events[record.date].push(record)
            }
        } catch (e) {
            console.error(`Failed to load hospital alarms for child ${child.id}`, e)
        }
    }

    return events
}

export function parseHospitalAlarmId(eventId: string): number | null {
    if (eventId.startsWith('hospital-')) {
        const id = Number(eventId.replace('hospital-', ''))
        return Number.isNaN(id) ? null : id
    }
    const id = Number(eventId)
    return Number.isNaN(id) ? null : id
}
