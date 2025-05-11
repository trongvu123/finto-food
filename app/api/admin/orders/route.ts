import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/app/lib/auth"
import { OrderStatus } from "@prisma/client"


// GET /api/admin/orders
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        console.log('user', user)
        // if (!user || user.role !== "ADMIN") {
        //     return NextResponse.json(
        //         { error: "Unauthorized" },
        //         { status: 401 }
        //     )
        // }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const status = searchParams.get("status")
        const search = searchParams.get("search")

        const skip = (page - 1) * limit

        const where = {
            ...(status && status !== "ALL" && { status: status as OrderStatus }),
            ...(search && {
                OR: [
                    { userId: { contains: search } },
                    { phone: { contains: search } }
                ]
            })
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    images: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),
            prisma.order.count({ where })
        ])

        return NextResponse.json({
            orders,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        })
    } catch (error) {
        console.error("Error fetching orders:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { userId, status, total, shippingAddress, items, shippingProvince, shippingDistrict, shippingWard, phone, paymentMethod } = body

        const order = await prisma.order.create({
            data: {
                userId,
                status: status as OrderStatus,
                total,
                shippingAddress,
                shippingProvince,
                shippingDistrict,
                shippingWard,
                phone,
                paymentMethod,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                images: true
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error("Error creating order:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 