export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { ReviewStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: { status?: string };
  try {
    payload = (await req.json()) as typeof payload;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const statusValue = payload.status?.toUpperCase();
  const allowed = Object.values(ReviewStatus);
  if (!statusValue || !allowed.includes(statusValue as ReviewStatus)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  try {
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        status: statusValue as ReviewStatus,
        moderatedBy: session.email,
        moderatedAt: statusValue === 'PENDING' ? null : new Date(),
      },
      include: {
        product: { select: { name: true, slug: true } },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Failed to update review status', error);
    return NextResponse.json({ error: 'Unable to update review' }, { status: 500 });
  }
}
