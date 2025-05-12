// app/api/create-payment/route.ts
import { NextResponse } from 'next/server';
import PayOS from "@payos/node";

const payos = new PayOS(
  process.env.Client_ID_PAYOS!,
  process.env.API_key_PAYPOS!,
  process.env.Checksum_key_PAYOS!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, description } = body;

    const paymentBody = {
      orderCode: Date.now(),
      amount,
      description,
      returnUrl: '/thanh-toan/xac-nhan',
      cancelUrl: '/thanh-toan/xac-nhan',
    };

    const response = await payos.createPaymentLink(paymentBody);

    return NextResponse.json({ checkoutUrl: response.checkoutUrl }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
