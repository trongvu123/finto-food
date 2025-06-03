import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {


        const body = await request.json()
        const { serviceId, rating, content, userId } = body

        // Verify that the user has a completed order for this service
        const completedOrder = await prisma.serviceOrder.findFirst({
            where: {
                userId: userId,
                serviceId,
                status: "COMPLETED",
                hasReviewed: false,
            },
        })

        if (!completedOrder) {
            return NextResponse.json(
                { error: "You can only review services you have completed" },
                { status: 400 }
            )
        }

        // Create the review
        const review = await prisma.serviceReview.create({
            data: {
                rating,
                content,
                serviceId,
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        // Update the order to mark it as reviewed
        await prisma.serviceOrder.update({
            where: { id: completedOrder.id },
            data: { hasReviewed: true },
        })

        return NextResponse.json(review)
    } catch (error) {
        console.error("Error creating review:", error)
        return NextResponse.json({ error: "Error creating review" }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const supplierId = searchParams.get("supplierId")
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "5")
        const skip = (page - 1) * limit

        if (!supplierId) {
            return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 })
        }

        // Get reviews through services
        const services = await prisma.service.findMany({
            where: { supplierId },
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
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: limit,
                },
            },
        })

        const allReviews = services.flatMap(service => service.reviews)
        const total = await prisma.serviceReview.count({
            where: {
                service: {
                    supplierId,
                },
            },
        })

        return NextResponse.json({
            reviews: allReviews,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        })
    } catch (error) {
        console.error("Error fetching reviews:", error)
        return NextResponse.json({ error: "Error fetching reviews" }, { status: 500 })
    }
} 