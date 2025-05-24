import prisma from "@/lib/prisma"
import { isValidData } from "@/lib/utils"

export async function POST(req: Request) {
    const body = await req.json()
    if (body.code === '00') {
        const result = await prisma.order.update({
            where: {
                orderCode: String(body.data.orderCode)
            },
            data: {
                paid: true
            }
        })


        const orderItems = await prisma.orderItem.findMany({
            where: {
                orderId: result.id,
            },
        });

        for (const item of orderItems) {
            try {
                await prisma.product.update({
                    where: {
                        id: item.productId,
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                        sold: {
                            increment: item.quantity,
                        }
                    },
                });
            } catch (error) {
                console.error("Error updating product stock:", error);
                return new Response("Failed to update product stock", { status: 500 });
            }
        }

        return new Response(JSON.stringify(result.orderCode), { status: 200 })
    } else {
        return new Response("Invalid data", { status: 400 })
    }
    return new Response("OK", { status: 200 })
}
