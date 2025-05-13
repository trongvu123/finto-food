import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId') as string;
        const userId = searchParams.get('userId') as string;

        if (!productId || !userId) {
            return NextResponse.json({ error: "Missing productId or userId" }, { status: 400 });
        }

        const orderItem = await prisma.orderItem.findFirst({
            where: {
                productId: productId,
                userId: userId,
                order: {
                    status: "DELIVERED"
                }
            }
        });

        const hasPurchased = !!orderItem;

        return NextResponse.json(hasPurchased);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to check product purchase' }, { status: 500 });
    }
}
