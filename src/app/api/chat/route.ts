import { NextResponse } from 'next/server'

// Bu Next.js API route-i proxy sifatida yoki test uchun ishlatilishi mumkin.
// Lekin asosiy muloqot Spring Boot backend (https://aikids.duckdns.org) orqali amalga oshirilmoqda.
export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Test uchun javob
        return NextResponse.json({
            success: true,
            message: "Next.js API route is active",
            data: body
        })
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
}

export async function GET() {
    return NextResponse.json({ message: "Chat API is running via Next.js" })
}
