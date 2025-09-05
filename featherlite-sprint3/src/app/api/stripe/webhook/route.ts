// Use Node.js runtime because Stripe and Prisma cannot run on the Edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

/**
 * Stripe webhook handler. Listens for checkout.session.completed events
 * and persists order details to the database. To enable this handler
 * configure a webhook endpoint in your Stripe dashboard that points
 * to `/api/stripe/webhook` and set the STRIPE_WEBHOOK_SECRET in your
 * environment. See Stripe docs for further instructions.
 */
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
  // Only handle checkout session completion events for now
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    // Retrieve line items to capture SKUs and quantities
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const amountTotal = session.amount_total ?? 0;
    await prisma.order.create({
      data: {
        stripeSession: session.id,
        email: session.customer_details?.email ?? null,
        amountTotal,
        items: {
          create: lineItems.data.map((li: any) => ({
            sku: li.price?.nickname || li.description || 'unknown',
            qty: li.quantity ?? 1,
            priceCents: li.amount_subtotal / (li.quantity ?? 1),
          })),
        },
      },
    });
  }
  return NextResponse.json({ received: true });
}

// Disable body parsing so we can get the raw request body for Stripe signature verification.
// Do not use `as any` here because Next.js will attempt to parse type assertions at build time.
export const config = {
  api: {
    bodyParser: false,
  },
};