import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 検索API: 投稿・返信の内容を全文検索（削除済みは除外）
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  // 投稿の検索（削除済み除外）
  const posts = await prisma.post.findMany({
    where: {
      content: {
        contains: q,
        mode: 'insensitive',
      },
      deleted: false,
    },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // 返信の検索（削除済み除外）
  const replies = await prisma.reply.findMany({
    where: {
      content: {
        contains: q,
        mode: 'insensitive',
      },
      deleted: false,
    },
    include: { author: true, post: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return NextResponse.json({
    results: [
      ...posts.map((p) => ({
        type: 'post',
        id: p.id,
        content: p.content,
        user: p.author.username,
        createdAt: p.createdAt,
      })),
      ...replies.map((r) => ({
        type: 'reply',
        id: r.id,
        content: r.content,
        user: r.author.username,
        postId: r.postId,
        createdAt: r.createdAt,
      })),
    ],
  });
}
