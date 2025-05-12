import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { Prisma, OrderStatus } from "@prisma/client"

// POST /api/orders
export async function POST(req: NextRequest) {
    try {
        // Try to get user but don't require authentication
        let user = null
        try {
            user = await requireAuth(req)
        } catch (error) {
            // If authentication fails, continue with null user
            console.log("User not authenticated, proceeding with guest checkout")
        }

        const body = await req.json()
        const { items, shippingAddress, shippingProvince, shippingDistrict, shippingWard, phone, paymentMethod, fullName, email, userId } = body

        if (!items || !items.length) {
            return new NextResponse("Items are required", { status: 400 })
        }

        if (!shippingAddress || !shippingProvince || !shippingDistrict || !shippingWard || !phone) {
            return new NextResponse("Shipping information is required", { status: 400 })
        }

        if (!paymentMethod) {
            return new NextResponse("Payment method is required", { status: 400 })
        }

        // Calculate total
        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: items.map((item: any) => item.productId)
                }
            }
        })

        const total = items.reduce((sum: number, item: any) => {
            const product = products.find(p => p.id === item.productId)
            return sum + (product?.price || 0) * item.quantity
        }, 0)

        // Create order
        const orderData: any = {
            total,
            status: OrderStatus.PENDING,
            shippingAddress,
            shippingProvince,
            shippingDistrict,
            shippingWard,
            phone,
            paymentMethod,
            fullName,
            email,
            userId,
            items: {
                create: items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: products.find(p => p.id === item.productId)?.price || 0
                }))
            }
        }

        // Nếu có user => thêm `user.connect`
        


        const order = await prisma.order.create({
            data: orderData,

            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error("[ORDER_POST]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
}

// GET /api/orders
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
        if (error instanceof Error) {
            if (error.message === "Unauthorized") {
                return new NextResponse("Unauthorized", { status: 401 })
            }
        }
        console.error("[ORDERS_GET]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
} 