import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/admin/categories
export async function GET(request: Request) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" }
        })

        return NextResponse.json(categories)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// POST /api/admin/categories
export async function POST(request: Request) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()
        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 