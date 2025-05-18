import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') as string;

    const reviews = await prisma.review.count({
        where: {
            userId: userId
        }
    });

    const hasReviewed = reviews > 0;
    return NextResponse.json(hasReviewed);
}
