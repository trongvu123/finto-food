import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

// GET /api/products/[productId]
export async function GET(
    req: NextRequest,
    { params }: { params: { productId: string } }
) {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: params.productId
            },
            include: {
                category: true,
                brand: true
            }
        })

        if (!product) {
            return new NextResponse("Product not found", { status: 404 })
        }

        // Get related products
        const relatedProducts = await prisma.product.findMany({
            where: {
                OR: [
                    { categoryId: product.categoryId },
                    { brandId: product.brandId }
                ],
                NOT: {
                    id: product.id
                }
            },
            include: {
                category: true,
                brand: true
            },
            take: 4
        })

        return NextResponse.json({
            product,
            relatedProducts
        })
    } catch (error) {
        console.error("[PRODUCT_GET]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
} 