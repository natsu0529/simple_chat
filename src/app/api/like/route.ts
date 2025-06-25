import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// いいね追加API
export async function POST(req: Request) {
  const { userId, postId } = await req.json();
  if (!userId || !postId) {
    return NextResponse.json({ error: 'userIdとpostIdは必須です' }, { status: 400 });
  }
  try {
    const like = await prisma.like.create({
      data: { userId, postId },
    });
    return NextResponse.json({ success: true, like });
  } catch (e) {
    return NextResponse.json({ error: '既にいいね済みです' }, { status: 409 });
  }
}

// いいね解除API
export async function DELETE(req: Request) {
  const { userId, postId } = await req.json();
  if (!userId || !postId) {
    return NextResponse.json({ error: 'userIdとpostIdは必須です' }, { status: 400 });
  }
  await prisma.like.deleteMany({ where: { userId, postId } });
  return NextResponse.json({ success: true });
}
