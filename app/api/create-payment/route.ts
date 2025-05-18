// app/api/create-payment/route.ts
import { NextResponse } from 'next/server';
import PayOS from "@payos/node";
import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import dayjs from 'dayjs';
const payos = new PayOS(
  process.env.Client_ID_PAYOS!,
  process.env.API_key_PAYPOS!,
  process.env.Checksum_key_PAYOS!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingAddress, shippingProvince, shippingDistrict, shippingWard, phone, paymentMethod, fullName, email, userId } = body
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items.map((item: any) => item.productId)
        }
      }
    })

    const total = items.reduce((sum: number, item: any) => {
      const product = products.find(p => p.id === item.productId)
      return sum + (product?.price || 0) * item.quantity
    }, 0)
    const orderData: any = {
      total,
      orderCode: Date.now().toString(),
      status: OrderStatus.PENDING,
      expireBankingAt:dayjs().add(5, 'minute').toDate(),
      shippingAddress,
      shippingProvince,
      shippingDistrict,
      shippingWard,
      phone,
      paymentMethod,
      fullName,
      email,
      userId,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: products.find(p => p.id === item.productId)?.price || 0,
          userId: userId
        }))
      }
    }
    const order = await prisma.order.create({
      data: orderData,

      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    const amount = total < 500000 ? total + 30000 : total;
    const description = order.orderCode?.toString() || '';
    const paymentBody = {
      orderCode: Number(order.orderCode),
      amount,
      description,
      returnUrl: 'http://localhost:3000/thanh-toan/xac-nhan',
      cancelUrl: '/thanh-toan/xac-nhan',
    };

    const response = await payos.createPaymentLink(paymentBody);
    // NextResponse.redirect(response.checkoutUrl);
    return NextResponse.json({ checkoutUrl: response.checkoutUrl }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
