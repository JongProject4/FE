// src/lib/api.ts
// 백엔드 API 클라이언트 - Spring Boot 서버와 통신

// Backend API URL configuration
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aikids.duckdns.org').replace(/\/$/, '')
if (typeof window !== 'undefined') (window as any).API_BASE_URL = API_BASE_URL

// ── JWT 토큰 관리 ──
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
}

export function setAccessToken(token: string) {
    localStorage.setItem('accessToken', token)
}

export function removeAccessToken() {
    localStorage.removeItem('accessToken')
}

// ── 공통 fetch wrapper ──
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAccessToken()

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    console.log(`[API Request] ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`)
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (res.status === 401) {
        removeAccessToken()
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
        throw new Error('Unauthorized')
    }

    if (!res.ok) {
        const errorBody = await res.text().catch(() => '')
        throw new Error(`API Error ${res.status}: ${errorBody}`)
    }

    // 204 No Content 등 body 없는 응답 처리
    if (res.status === 204) return undefined as T

    return res.json()
}

// ============================================================
// Auth API
// ============================================================

/** 백엔드 Google OAuth2 로그인 시작 URL */
export function getGoogleLoginUrl(): string {
    return `${API_BASE_URL}/oauth2/authorization/google`
}

// ============================================================
// User API  (/api/users)
// ============================================================

export interface CurrentUser {
    id: number
    socialId: string
    socialType: 'GOOGLE' | 'KAKAO'
    name: string | null
    phoneNumber: string | null
    fcmToken: string | null
}

export interface UpdateUserInfoRequest {
    phoneNumber?: string
    fcmToken?: string
}

export interface PatchUserInfoRequest {
    name?: string
    phoneNumber?: string
    fcmToken?: string
}

export interface UserActionResponse {
    success: boolean
    message: string
}

/** 현재 로그인 사용자 정보 */
export async function getMe(): Promise<CurrentUser> {
    return apiFetch<CurrentUser>('/api/users/me')
}

/** 사용자 추가 정보 업데이트 (POST) */
export async function updateMe(data: UpdateUserInfoRequest): Promise<UserActionResponse> {
    return apiFetch<UserActionResponse>('/api/users/me', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

/** 사용자 정보 부분 수정 (PATCH) */
export async function patchMe(data: PatchUserInfoRequest): Promise<UserActionResponse> {
    return apiFetch<UserActionResponse>('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}

/** 사용자 계정 삭제 */
export async function deleteMe(): Promise<UserActionResponse> {
    return apiFetch<UserActionResponse>('/api/users/me', {
        method: 'DELETE',
    })
}

/** FCM 토큰 업데이트 */
export async function updateFcmToken(fcmToken: string): Promise<void> {
    return apiFetch<void>('/api/users/me/fcm-token', {
        method: 'PATCH',
        body: JSON.stringify({ fcmToken }),
    })
}

// ============================================================
// Child API  (/api/children)
// ============================================================

export interface ChildResponse {
    id: number
    userId: number
    name: string
    birthdate: string // ISO datetime
    gender: 'MALE' | 'FEMALE'
    height: number | null
    weight: number | null
    medicalHistory: string | null
    allergies: string | null
}

export interface CreateChildRequest {
    name: string
    birthdate: string // ISO datetime
    gender: 'MALE' | 'FEMALE'
    height?: number | null
    weight?: number | null
    medicalHistory?: string
    allergies?: string
}

export interface PatchChildRequest {
    name?: string
    birthdate?: string
    gender?: 'MALE' | 'FEMALE'
    height?: number | null
    weight?: number | null
    medicalHistory?: string
    allergies?: string
}

/** 내 아이 목록 조회 */
export async function getChildren(): Promise<ChildResponse[]> {
    return apiFetch<ChildResponse[]>('/api/children')
}

/** 특정 아이 조회 */
export async function getChild(childId: number): Promise<ChildResponse> {
    return apiFetch<ChildResponse>(`/api/children/${childId}`)
}

/** 아이 등록 */
export async function createChild(data: CreateChildRequest): Promise<ChildResponse> {
    return apiFetch<ChildResponse>('/api/children', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

/** 아이 정보 수정 */
export async function patchChild(childId: number, data: PatchChildRequest): Promise<ChildResponse> {
    return apiFetch<ChildResponse>(`/api/children/${childId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}

/** 아이 삭제 */
export async function deleteChild(childId: number): Promise<UserActionResponse> {
    return apiFetch<UserActionResponse>(`/api/children/${childId}`, {
        method: 'DELETE',
    })
}

// ============================================================
// Health Log API  (/api/children/{childId}/health-log)
// ============================================================

export type LogType = 'CONSULTATION' | 'MEDICATION' | 'HOSPITAL'

export interface HealthLogRequest {
    logType: LogType
    content: string
    eventDate: string // ISO datetime
}

export interface HealthLogResponse {
    id: number
    childId: number
    logType: LogType
    content: string
    eventDate: string // ISO datetime
}

/** 아이의 헬스로그 조회 (logType으로 필터 가능) */
export async function getHealthLogs(
    childId: number,
    logType?: LogType
): Promise<HealthLogResponse[]> {
    const query = logType ? `?logType=${logType}` : ''
    return apiFetch<HealthLogResponse[]>(`/api/children/${childId}/health-log${query}`)
}

/** 헬스로그 생성 */
export async function createHealthLog(
    childId: number,
    data: HealthLogRequest
): Promise<HealthLogResponse> {
    return apiFetch<HealthLogResponse>(`/api/children/${childId}/health-log`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

// ============================================================
// Chat API  (/api/chat)
// ============================================================

export interface ChatCreateRequest {
    childId: number;
    title: string;
}

export interface ChatCreateResponse {
    chatId: number;
}

export interface ChatMessageRequest {
    message: string;
}

export interface ChatDetailResponse {
    role: 'USER' | 'AI';
    content: string;
    time: string;
}

/** 새로운 상담 방 만들기 */
export async function createChat(data: ChatCreateRequest): Promise<ChatCreateResponse> {
    return apiFetch<ChatCreateResponse>('/api/chat/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

/** 특정 방에 메시지 보내고 AI 답변 받기 */
export async function sendChatMessage(chatId: number, message: string): Promise<string> {
    const res = await apiFetch<{ answer: string }>(`/api/chat/rooms/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: message }),
    })
    return res.answer
}

/** 특정 아이의 상담 방 목록 가져오기 */
export async function getChatRooms(childId: number): Promise<number[]> {
    return apiFetch<number[]>(`/api/chat/rooms/list/${childId}`)
}

/** 특정 방의 과거 대화 내역 가져오기 */
export async function getChatHistory(chatId: number): Promise<ChatDetailResponse[]> {
    return apiFetch<ChatDetailResponse[]>(`/api/chat/rooms/${chatId}/messages`)
}
