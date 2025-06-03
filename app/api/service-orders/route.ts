import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma, ServiceStatus } from "@prisma/client"

// GET /api/service-orders - Get all service orders with optional filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") as ServiceStatus | undefined
        const paid = searchParams.get("paid") ? searchParams.get("paid") === "true" : undefined
        const userId = searchParams.get("userId") || undefined

        const where: Prisma.ServiceOrderWhereInput = {
            AND: [
                search
                    ? {
                        OR: [
                            { orderCode: { contains: search, mode: Prisma.QueryMode.insensitive } },
                            { userName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                            { service: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
                        ],
                    }
                    : {},
                status ? { status } : {},
                paid !== undefined ? { paid } : {},
                userId ? { userId } : {},
            ],
        }

        const orders = await prisma.serviceOrder.findMany({
            where,
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
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(orders)
    } catch (error) {
        console.error("Error fetching service orders:", error)
        return NextResponse.json({ error: "Error fetching service orders" }, { status: 500 })
    }
}

// POST /api/service-orders - Create a new service order
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            serviceId,
            userId,
            userName,
            userPhone,
            userAddress,
            userEmail,
            userNote,
            petName,
            petBreed,
            petAge,
            petWeight,
            petGender,
            petImage,
            petNote,
            petStatus,
            orderTime,
            total,
        } = body
        const petAgeParsed = parseInt(petAge)
        const petWeightParsed = parseFloat(petWeight)
        // Generate order code (you can customize this format)
        const orderCode = `PET${Date.now().toString().slice(-6)}`

        const order = await prisma.serviceOrder.create({
            data: {
                orderCode,
                serviceId,
                userId,
                userName,
                userPhone,
                userAddress,
                userEmail,
                userNote,
                petName,
                petBreed,
                petAge: petAgeParsed,
                petWeight: petWeightParsed,
                petGender,
                petImage,
                petNote,
                petStatus,
                orderTime: new Date(orderTime),
                total,
                status: "PENDING",
                paid: false,
                paymentMethod: "Thanh toán sau khi hoàn thành",
            },
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error("Error creating service order:", error)
        return NextResponse.json({ error: "Error creating service order" }, { status: 500 })
    }
}

// PUT /api/service-orders - Update a service order
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, ...updateData } = body

        const order = await prisma.serviceOrder.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(order)
    } catch (error) {
        console.error("Error updating service order:", error)
        return NextResponse.json({ error: "Error updating service order" }, { status: 500 })
    }
}

// DELETE /api/service-orders - Delete a service order
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
        }

        await prisma.serviceOrder.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Service order deleted successfully" })
    } catch (error) {
        console.error("Error deleting service order:", error)
        return NextResponse.json({ error: "Error deleting service order" }, { status: 500 })
    }
}
