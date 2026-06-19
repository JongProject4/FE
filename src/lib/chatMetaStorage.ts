const STORAGE_KEY = 'chat-metadata'

export interface StoredChatMeta {
    category?: string
    riskLevel?: string
    title?: string
    childName?: string
    date?: string
    isVoice?: boolean
}

type ChatMetaMap = Record<string, StoredChatMeta>

function readMap(): ChatMetaMap {
    if (typeof window === 'undefined') return {}
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as ChatMetaMap) : {}
    } catch {
        return {}
    }
}

function writeMap(map: ChatMetaMap) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function getChatMeta(chatId: number): StoredChatMeta | undefined {
    return readMap()[String(chatId)]
}

export function saveChatMeta(chatId: number, meta: StoredChatMeta) {
    const map = readMap()
    map[String(chatId)] = { ...map[String(chatId)], ...meta }
    writeMap(map)
}

export function removeChatMeta(chatId: number) {
    const map = readMap()
    delete map[String(chatId)]
    writeMap(map)
}
