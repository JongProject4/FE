const STORAGE_KEY = 'medication-taken-times'

type TakenMap = Record<string, number>

function readMap(): TakenMap {
    if (typeof window === 'undefined') return {}
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as TakenMap) : {}
    } catch {
        return {}
    }
}

function writeMap(map: TakenMap) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function getTakenKey(childId: number, alarmId: number): string {
    return `${childId}-${alarmId}`
}

export function getLastTakenAt(childId: number, alarmId: number): number | null {
    const ts = readMap()[getTakenKey(childId, alarmId)]
    return ts ?? null
}

export function markMedicationTaken(childId: number, alarmId: number): void {
    const map = readMap()
    map[getTakenKey(childId, alarmId)] = Date.now()
    writeMap(map)
}

export function getRemainingMs(
    intervalHour: number,
    lastTakenAt: number | null,
    now = Date.now()
): number {
    if (lastTakenAt === null) return 0

    const intervalMs = intervalHour * 60 * 60 * 1000
    const nextAt = lastTakenAt + intervalMs
    return Math.max(0, nextAt - now)
}

export function formatRemaining(ms: number): string {
    const totalSec = Math.ceil(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
