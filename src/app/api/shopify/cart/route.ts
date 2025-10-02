export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import {
  addLinesToCart,
  createCart,
  fetchCart,
  removeCartLines,
  updateCartLines,
} from '@/lib/shopify';

function invalid(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cartId = searchParams.get('cartId');
  if (!cartId) {
    return invalid('Missing cartId parameter.');
  }
  try {
    const cart = await fetchCart(cartId);
    if (!cart) {
      return invalid('Cart not found.', 404);
    }
    return NextResponse.json({ cart });
  } catch (err: any) {
    console.error('Failed to fetch cart', err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to fetch cart.';
    return invalid(message, 500);
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { cartId, lines } = body ?? {};
  if (!Array.isArray(lines) || lines.length === 0) {
    return invalid('Request must include at least one line.');
  }

  let sanitizedLines: { merchandiseId: string; quantity: number }[];
  try {
    sanitizedLines = lines.map((line: any) => {
      if (!line?.merchandiseId) {
        throw new Error('Each line must include a merchandiseId.');
      }
      return {
        merchandiseId: String(line.merchandiseId),
        quantity: Number(line.quantity) || 1,
      };
    });
  } catch (validationError: any) {
    const message =
      typeof validationError?.message === 'string'
        ? validationError.message
        : 'Invalid cart line payload.';
    return invalid(message);
  }

  try {
    const cart = cartId
      ? await addLinesToCart(cartId, sanitizedLines)
      : await createCart(sanitizedLines);
    return NextResponse.json({ cart });
  } catch (err: any) {
    console.error('Failed to add lines to cart', err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to update cart.';
    return invalid(message, 500);
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { cartId, lines } = body ?? {};
  if (!cartId || !Array.isArray(lines) || lines.length === 0) {
    return invalid('cartId and lines are required.');
  }
  let sanitizedLines: { id: string; quantity: number }[];
  try {
    sanitizedLines = lines.map((line: any) => {
      if (!line?.id) {
        throw new Error('Each line must include an id.');
      }
      return {
        id: String(line.id),
        quantity: Number(line.quantity) || 1,
      };
    });
  } catch (validationError: any) {
    const message =
      typeof validationError?.message === 'string'
        ? validationError.message
        : 'Invalid cart line payload.';
    return invalid(message);
  }

  try {
    const cart = await updateCartLines(cartId, sanitizedLines);
    return NextResponse.json({ cart });
  } catch (err: any) {
    console.error('Failed to update cart lines', err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to update cart.';
    return invalid(message, 500);
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { cartId, lineIds } = body ?? {};
  if (!cartId) {
    return invalid('cartId is required.');
  }
  if (!Array.isArray(lineIds) || lineIds.length === 0) {
    return invalid('lineIds is required.');
  }
  const sanitizedLineIds: string[] = [];
  for (const id of lineIds) {
    if (!id) {
      return invalid('lineIds must contain only valid values.');
    }
    sanitizedLineIds.push(String(id));
  }
  try {
    const cart = await removeCartLines(cartId, sanitizedLineIds);
    return NextResponse.json({ cart });
  } catch (err: any) {
    console.error('Failed to remove cart lines', err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to update cart.';
    return invalid(message, 500);
  }
}

