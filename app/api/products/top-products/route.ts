import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const result = await prisma.product.findMany({
            take: 4,
            orderBy: {
                sold: "desc"
            },
            include: {
                category: true
            }

        })

        return NextResponse.json(result)
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}