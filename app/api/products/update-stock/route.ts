import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

// POST /api/products/update-stock
export async function POST(req: NextRequest) {
    try {
        // Require admin authentication
        await requireAuth(req)

        const body = await req.json()
        const { items, action } = body // action: 'decrease' or 'increase'

        if (!items || !items.length) {
            return new NextResponse("Items are required", { status: 400 })
        }

        if (!action || !['decrease', 'increase'].includes(action)) {
            return new NextResponse("Action must be either 'decrease' or 'increase'", { status: 400 })
        }

        // Update stock for each product
        const updates = items.map(async (item: { productId: string, quantity: number }) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            })

            if (!product) {
                throw new Error(`Product with id ${item.productId} not found`)
            }

            // Calculate new stock
            const newStock = action === 'decrease'
                ? product.stock - item.quantity
                : product.stock + item.quantity

            // Ensure stock doesn't go below 0
            if (newStock < 0) {
                throw new Error(`Not enough stock for product ${product.name}`)
            }

            // Update product stock
            return prisma.product.update({
                where: { id: item.productId },
                data: { stock: newStock }
            })
        })

        // Execute all updates
        const updatedProducts = await Promise.all(updates)

        return NextResponse.json(updatedProducts)
    } catch (error) {
        console.error("[UPDATE_STOCK]", error)
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 400 })
        }
        return new NextResponse("Internal error", { status: 500 })
    }
} 