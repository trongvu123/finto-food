import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id: params.id },
            include: {
                services: {
                    include: {
                        reviews: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (!supplier) {
            return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
        }

        // Calculate average rating and review count from all service reviews
        const allReviews = supplier.services.flatMap((service) => service.reviews)
        const averageRating = allReviews.length > 0
            ? allReviews.reduce((acc: number, review) => acc + review.rating, 0) / allReviews.length
            : 0

        const supplierWithStats = {
            ...supplier,
            rating: Number(averageRating.toFixed(1)),
            reviewCount: allReviews.length,
        }

        return NextResponse.json(supplierWithStats)
    } catch (error) {
        console.error("Error fetching supplier:", error)
        return NextResponse.json({ error: "Error fetching supplier" }, { status: 500 })
    }
} 