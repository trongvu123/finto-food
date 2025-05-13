import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url)
        const productId = searchParams.get('productId') as string
        const result = await prisma.review.findMany({
            where: {
                productId: productId,
                status: "ACTIVE"
            },
            include: {
                user: true
            }
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {productId, userId, content, rating} = body
        const result = await prisma.review.create({
            data: body
        })
        return NextResponse.json(result)
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const {id} = body
        const result = await prisma.review.update({
            where: {
                id: id
            },
            data: {
                status : body.status
            }
        })
        return NextResponse.json(result)
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}