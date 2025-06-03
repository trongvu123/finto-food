import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const city = searchParams.get("city")
        const serviceType = searchParams.get("serviceType")

        const suppliers = await prisma.supplier.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { name: { contains: search, mode: "insensitive" } },
                            { email: { contains: search, mode: "insensitive" } },
                        ],
                    },
                    city ? { city } : {},
                    serviceType ? { serviceType } : {},
                ],
            },
            include: {
                services: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(suppliers)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, phone, address, city, serviceType, imageUrls, description } = body

        const supplier = await prisma.supplier.create({
            data: {
                name,
                email,
                phone,
                address,
                city,
                serviceType,
                imageUrl: imageUrls,
                description,
            },
        })

        return NextResponse.json(supplier)
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, name, email, phone, address, city, serviceType, imageUrls, description } = body

        const supplier = await prisma.supplier.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                address,
                city,
                serviceType,
                imageUrl: imageUrls,
                description,
            },
        })

        return NextResponse.json(supplier)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 })
        }

        await prisma.supplier.delete({
            where: { id },
        })

        return NextResponse.json({ message: "Supplier deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
} 