import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 返信作成API
export async function POST(req: Request) {
  const { content, authorId, postId } = await req.json();
  if (!content || !authorId || !postId) {
    return NextResponse.json({ error: 'content, authorId, postIdは必須です' }, { status: 400 });
  }
  const reply = await prisma.reply.create({
    data: {
      content,
      authorId,
      postId,
    },
  });
  return NextResponse.json(reply);
}

// 返信一覧取得API（オプション）
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = Number(searchParams.get('postId'));
  if (!postId) {
    return NextResponse.json({ error: 'postIdは必須です' }, { status: 400 });
  }
  const replies = await prisma.reply.findMany({
    where: { postId, deleted: false },
    include: {
      author: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(replies);
}
