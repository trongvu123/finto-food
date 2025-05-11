import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/admin/categories/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const category = await prisma.category.findUnique({
            where: { id: params.id }
        })

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 })
        }

        return NextResponse.json(category)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// PATCH /api/admin/categories/[id]
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()
        const category = await prisma.category.update({
            where: { id: params.id },
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

// DELETE /api/admin/categories/[id]
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await prisma.category.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 