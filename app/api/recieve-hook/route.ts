import prisma from "@/lib/prisma"
import { isValidData } from "@/lib/utils"

export async function POST(req: Request) {
    const body = await req.json()
    console.log("body", body)
   if(body.code === '00') {
        const result = await prisma.order.update({
            where: {
                orderCode: String(body.data.orderCode)
            },
            data: {
                paid: true
            }
        })
        return new Response(JSON.stringify(result.orderCode), { status: 200 })
    }else {
        return new Response("Invalid data", { status: 400 })
    }
    return new Response("OK", { status: 200 })
}