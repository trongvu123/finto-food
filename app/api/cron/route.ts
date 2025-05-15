import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req : NextRequest) {
    try {
        const now = new Date()
        const result = await prisma.order.deleteMany({
            where: {
                status: "PENDING",
                paid: false,
                paymentMethod: "banking",
                expireBankingAt:{
                    lte : now
                }
            }
        })
        return NextResponse.json({ deleteCount: result.count });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
    
}