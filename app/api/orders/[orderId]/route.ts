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
        websiteCarrier: body.websiteCarrier
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const resolveParams = await params;
    const orderId = resolveParams.orderId;
    let order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        paymentMethod: true,
        phone: true,
        shippingAddress: true,
        shippingDistrict: true,
        shippingProvince: true,
        shippingWard: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                name: true,
                images: true,
                price: true
              }
            }
          }
        }
      }
    });

    // Nếu không tìm thấy theo ID, thử tìm theo orderCode
    if (!order) {
      order = await prisma.order.findUnique({
        where: {
          orderCode: orderId, // Sử dụng cùng param nhưng tìm theo orderCode
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          paymentMethod: true,
          phone: true,
          shippingAddress: true,
          shippingDistrict: true,
          shippingProvince: true,
          shippingWard: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
              product: {
                select: {
                  name: true,
                  images: true,
                  price: true
                }
              }
            }
          }
        }
      });
    }

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
