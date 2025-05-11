import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

// GET /api/admin/products
export async function GET(request: Request) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const categoryId = searchParams.get("categoryId")
        const brandId = searchParams.get("brandId")
        const search = searchParams.get("search")

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

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    brand: true
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.product.count({ where })
        ])

        return NextResponse.json({
            products,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// POST /api/admin/products
export async function POST(request: Request) {
    try {
        const user = await getAuthUser(request as any)
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const data = await request.json()
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                images: data.images,
                categoryId: data.categoryId,
                brandId: data.brandId
            },
            include: {
                category: true,
                brand: true
            }
        })

        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 