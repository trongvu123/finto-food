import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const user = await getAuthUser(request as any)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        })

        return NextResponse.json({ user: userData })
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
} 