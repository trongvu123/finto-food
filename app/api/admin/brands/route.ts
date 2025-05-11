import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/admin/brands
export async function GET(request: Request) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const brands = await prisma.brand.findMany({
            orderBy: { name: "asc" }
        })

        return NextResponse.json(brands)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// POST /api/admin/brands
export async function POST(request: Request) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()
        const brand = await prisma.brand.create({
            data: {
                name: data.name,
                description: data.description
            }
        })

        return NextResponse.json(brand)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 