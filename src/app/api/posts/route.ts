import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 投稿の新規作成
export async function POST(req: Request) {
  try {
    const { content, authorId } = await req.json();
    if (!content || !authorId) {
      return NextResponse.json({ error: 'contentとauthorIdは必須です' }, { status: 400 });
    }
    const post = await prisma.post.create({
      data: {
        content,
        authorId,
      },
    });
    return NextResponse.json(post);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'サーバーエラー' }, { status: 500 });
  }
}

// 投稿一覧取得
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { deleted: false },
      include: {
        author: { select: { id: true, username: true } },
        likes: true,
        replies: {
          include: {
            author: { select: { id: true, username: true } }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
  } catch (err: any) {
    console.error('API /api/posts error:', err);
    // エラー時は空配列を返す
    return NextResponse.json([], { status: 200 });
  }
}
