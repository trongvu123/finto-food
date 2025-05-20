import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderItem } from "@prisma/client";

export async function GET() {
    try {
        const monthlyData = await Promise.all(
            [...Array(12)].map(async (_, i) => {
                const month = i + 1;
                const startDate = new Date(
                    new Date().getFullYear(),
                    month - 1,
                    1
                );
                const endDate = new Date(
                    new Date().getFullYear(),
                    month,
                    0
                );

                const orders = await prisma.order.findMany({
                    where: {
                        createdAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                        status: "DELIVERED",
                    },
                });

                const totalOrders = orders.length;
                let totalRevenue = 0;

                for (const order of orders) {
                    const orderItems = await prisma.orderItem.findMany({
                        where: {
                            orderId: order.id,
                        },
                    });

                    totalRevenue += orderItems.reduce((itemAcc: number, item: OrderItem) => {
                        return itemAcc + item.price * item.quantity;
                    }, 0);
                }

                return {
                    month,
                    totalOrders,
                    totalRevenue,
                };
            })
        );

        return NextResponse.json(monthlyData);
    } catch (error) {
        console.error("Error fetching monthly sales data:", error);
        return NextResponse.json(
            { message: "Failed to fetch monthly sales data" },
            { status: 500 }
        );
    }
}
