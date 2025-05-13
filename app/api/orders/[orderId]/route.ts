import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  orderId: string;
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { status, shipCode, carrier } = body;

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
        shipCode: shipCode,
        carrier: carrier,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
