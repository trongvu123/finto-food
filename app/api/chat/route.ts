import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { geminiModel, SYSTEM_PROMPT } from "@/lib/gemini"

// POST /api/chat
export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json()

        // Get product information for context
        const products = await prisma.product.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            }
        })

        const productContext = products.map(p =>
            `- ${p.name}: ${p.description} (${p.price.toLocaleString('vi-VN')}đ)`
        ).join('\n')

        // Prepare context for AI
        const context = `${SYSTEM_PROMPT}

Thông tin sản phẩm hiện có:
${productContext}

Câu hỏi của khách hàng: ${message}`

        // Generate response using Gemini
        const result = await geminiModel.generateContent(context)
        const response = result.response.text()

        return NextResponse.json({ message: response })
    } catch (error) {
        console.error("[CHAT]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
} 