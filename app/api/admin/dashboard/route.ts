import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/app/lib/auth"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req)

        // Get total orders
        const totalOrders = await prisma.order.count()

        // Get total revenue
        const orders = await prisma.order.findMany({
            where: {
                status: "DELIVERED"
            },
            select: {
                total: true
            }
        })
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

        // Get total products
        const totalProducts = await prisma.product.count()

        // Get total users
        const totalUsers = await prisma.user.count()

        // Get recent orders
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc"
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Get top selling products
        const topProducts = await prisma.orderItem.groupBy({
            by: ["productId"],
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: "desc"
                }
            },
            take: 5
        })

        const topProductsWithDetails = await Promise.all(
            topProducts.map(async (product) => {
                const details = await prisma.product.findUnique({
                    where: {
                        id: product.productId
                    },
                    select: {
                        name: true,
                        price: true,
                        images: true
                    }
                })
                return {
                    ...product,
                    product: details
                }
            })
        )

        return NextResponse.json({
            totalOrders,
            totalRevenue,
            totalProducts,
            totalUsers,
            recentOrders,
            topProducts: topProductsWithDetails
        })
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Unauthorized") {
                return new NextResponse("Unauthorized", { status: 401 })
            }
            if (error.message === "Forbidden") {
                return new NextResponse("Forbidden", { status: 403 })
            }
        }
        console.error("[DASHBOARD_GET]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
} 