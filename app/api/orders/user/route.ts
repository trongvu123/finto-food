import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

// GET /api/orders/user
export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth(req)

        const orders = await prisma.order.findMany({
            where: {
                userId: user.id
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true,
                                price: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return NextResponse.json(orders)
    } catch (error) {
        console.error("[ORDERS_USER_GET]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
} 