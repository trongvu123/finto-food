import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/service-orders/:id - Get a service order by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        if (!id) {
            return NextResponse.json({ error: "Service order ID is required" }, { status: 400 })
        }

        const order = await prisma.serviceOrder.findUnique({
            where: { id },
            include: {
                service: {
                    select: {
                        name: true,
                        supplier: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        })

        if (!order) {
            return NextResponse.json({ error: "Service order not found" }, { status: 404 })
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error("Error fetching service order:", error)
        return NextResponse.json({ error: "Error fetching service order" }, { status: 500 })
    }
}
