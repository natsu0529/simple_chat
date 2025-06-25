import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 投稿削除API（論理削除）
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const postId = Number(params.id);
  if (!postId) {
    return NextResponse.json({ error: 'idが不正です' }, { status: 400 });
  }
  const post = await prisma.post.update({
    where: { id: postId },
    data: { deleted: true },
  });
  return NextResponse.json({ success: true, post });
}
