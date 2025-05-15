import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

// POST /api/orders/[orderId]/cancel
export async function POST(
    req: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const user = await requireAuth(req)
        const { orderId } = params

        // Get order and check ownership
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true
            }
        })

        if (!order) {
            return new NextResponse("Order not found", { status: 404 })
        }

        if (order.userId !== user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Check if order can be cancelled
        if (!['PENDING', 'PROCESSING'].includes(order.status)) {
            return new NextResponse("Order cannot be cancelled", { status: 400 })
        }

        // Start transaction to update order and restore product stock
        const result = await prisma.$transaction(async (tx) => {
            // Update order status
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            })

            // Restore product stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            increment: item.quantity
                        },
                        sold: {
                            decrement: item.quantity
                        }
                    }
                })
            }

            return updatedOrder
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("[ORDER_CANCEL]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
} 