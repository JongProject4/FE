const CATEGORY_LABELS: Record<string, string> = {
    FEVER: '발열',
    DIGESTIVE: '소화기',
    RESPIRATORY: '호흡기',
    SKIN: '피부',
    TRAUMA: '외상',
    ETC: '기타',
    COUGH: '기침',
    RASH: '피부',
    ANALYZING: '분석 중',
}

const RISK_LABELS: Record<string, string> = {
    HOME_CARE: '가정 처치',
    CLINIC_VISIT: '외래 방문',
    EMERGENCY_ROOM: '응급실',
    RE_CONSULT: '재상담',
    NORMAL: '가정 처치',
    HOSPITAL: '응급실',
    ANALYZING: '분석 중',
}

const RISK_COLORS: Record<string, string> = {
    HOME_CARE: 'bg-[#E8F8F0] text-[#2D9B6A]',
    NORMAL: 'bg-[#E8F8F0] text-[#2D9B6A]',
    CLINIC_VISIT: 'bg-[#FFF7E6] text-[#D97706]',
    EMERGENCY_ROOM: 'bg-[#FFF0F0] text-[#EF4444]',
    HOSPITAL: 'bg-[#FFF0F0] text-[#EF4444]',
    RE_CONSULT: 'bg-[#EFF6FF] text-[#3B82F6]',
    ANALYZING: 'bg-[#F1F5F9] text-[#94A3B8]',
}

export function getCategoryLabel(category?: string | null): string {
    if (!category) return CATEGORY_LABELS.ANALYZING
    return CATEGORY_LABELS[category] ?? category
}

export function getRiskLabel(riskLevel?: string | null): string {
    if (!riskLevel) return RISK_LABELS.ANALYZING
    return RISK_LABELS[riskLevel] ?? riskLevel
}

export function getRiskBadgeClass(riskLevel?: string | null): string {
    if (!riskLevel) return RISK_COLORS.ANALYZING
    return RISK_COLORS[riskLevel] ?? RISK_COLORS.ANALYZING
}
