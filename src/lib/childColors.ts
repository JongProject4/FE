export interface ChildColor {
  dot: string
  bg: string
  text: string
  border: string
}

const PALETTE: ChildColor[] = [
  { dot: '#4A90D9', bg: 'rgba(74,144,217,0.14)', text: '#1D4ED8', border: '#4A90D9' },
  { dot: '#8B5CF6', bg: 'rgba(139,92,246,0.14)', text: '#6D28D9', border: '#8B5CF6' },
  { dot: '#F59E0B', bg: 'rgba(245,158,11,0.14)', text: '#B45309', border: '#F59E0B' },
  { dot: '#EC4899', bg: 'rgba(236,72,153,0.14)', text: '#BE185D', border: '#EC4899' },
  { dot: '#10B981', bg: 'rgba(16,185,129,0.14)', text: '#047857', border: '#10B981' },
  { dot: '#EF4444', bg: 'rgba(239,68,68,0.12)', text: '#B91C1C', border: '#EF4444' },
]

function hashChildId(childId: string | number): number {
  const str = String(childId)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getChildColor(childId: string | number): ChildColor {
  if (!childId && childId !== 0) return PALETTE[0]
  return PALETTE[hashChildId(childId) % PALETTE.length]
}
