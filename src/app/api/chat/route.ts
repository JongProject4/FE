import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // Force Vercel to treat this as an API endpoint, not static HTML


// Spring Boot backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aikids.duckdns.org'

/**
 * POST /api/chat
 * Proxies chat requests to the Spring Boot backend.
 * Frontend sends: { consultationId, messages, imageUrl }
 * This route forwards to the correct backend endpoint.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { consultationId, messages, imageUrl } = body

        // Extract the latest user message
        const lastUserMessage = messages?.filter((m: any) => m.role === 'user')?.pop()
        const messageContent = lastUserMessage?.content || ''

        if (!consultationId) {
            return NextResponse.json(
                { error: 'consultationId is required' },
                { status: 400 }
            )
        }

        // Forward Authorization header
        const authHeader = req.headers.get('Authorization') || ''

        // Call Spring Boot backend: POST /api/chat/rooms/{chatId}/messages
        const backendRes = await fetch(
            `${BACKEND_URL}/api/chat/rooms/${consultationId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authHeader ? { Authorization: authHeader } : {}),
                },
                body: JSON.stringify({ content: messageContent }),
            }
        )

        if (!backendRes.ok) {
            const errorText = await backendRes.text().catch(() => '')
            console.error(`Backend error ${backendRes.status}: ${errorText}`)
            return NextResponse.json(
                { error: `Backend error: ${backendRes.status}` },
                { status: backendRes.status }
            )
        }

        const data = await backendRes.json()

        // Backend returns { answer: "..." }
        // Return as streaming-compatible response
        return NextResponse.json({
            answer: data.answer || data.message || 'No response',
        })
    } catch (error: any) {
        console.error('Chat API proxy error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Chat API is running',
        backend: BACKEND_URL,
    })
}
