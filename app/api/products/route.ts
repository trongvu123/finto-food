import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { Prisma } from "@prisma/client"

// GET /api/products
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "12")
        const categoryId = searchParams.get("categoryId")
        const brandId = searchParams.get("brandId")
        const search = searchParams.get("search")
        const sort = searchParams.get("sort") || "newest"

        const where = {
            ...(categoryId && { categoryId }),
            ...(brandId && { brandId }),
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            })
        }

        const orderBy = {
            ...(sort === "newest" && { createdAt: "desc" as Prisma.SortOrder }),
            ...(sort === "price_asc" && { price: "asc" as Prisma.SortOrder }),
            ...(sort === "price_desc" && { price: "desc" as Prisma.SortOrder })
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    brand: true
                },
                orderBy,
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.product.count({ where })
        ])

        return NextResponse.json({
            products,
            total,
            pages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error("[PRODUCTS_GET]", error)
        return new NextResponse("Internal error", { status: 500 })
    }
} 