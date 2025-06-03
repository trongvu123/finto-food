import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// GET /api/services - Get all services with optional filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || ""
        const category = searchParams.get("category") || undefined
        const supplierId = searchParams.get("supplierId") || undefined
        const status = searchParams.get("status") || undefined

        const where: Prisma.ServiceWhereInput = {
            AND: [
                search
                    ? {
                        OR: [
                            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
                        ],
                    }
                    : {},
                category ? { category } : {},
                supplierId ? { supplierId } : {},
                status ? { status } : {},
            ],
        }

        const services = await prisma.service.findMany({
            where,
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(services)
    } catch (error) {
        console.error("Error fetching services:", error)
        return NextResponse.json({ error: "Error fetching services" }, { status: 500 })
    }
}

// POST /api/services - Create a new service
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            name,
            description,
            price,
            salePrice,
            supplierId,
            category,
            images,
        } = body

        const service = await prisma.service.create({
            data: {
                name,
                description,
                price,
                salePrice,
                supplierId,
                category,
                images,
                status: "active",
            },
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return NextResponse.json(service)
    } catch (error) {
        console.error("Error creating service:", error)
        return NextResponse.json({ error: "Error creating service" }, { status: 500 })
    }
}

// PUT /api/services - Update a service
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, ...updateData } = body

        const service = await prisma.service.update({
            where: { id },
            data: updateData,
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return NextResponse.json(service)
    } catch (error) {
        console.error("Error updating service:", error)
        return NextResponse.json({ error: "Error updating service" }, { status: 500 })
    }
}

// DELETE /api/services - Delete a service
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
        }

        await prisma.service.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Service deleted successfully" })
    } catch (error) {
        console.error("Error deleting service:", error)
        return NextResponse.json({ error: "Error deleting service" }, { status: 500 })
    }
} 