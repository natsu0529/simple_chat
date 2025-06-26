import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'ユーザー名とパスワードは必須です' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが存在しません' }, { status: 404 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 });
    }
    // セッションやJWT発行はここで実装（簡易化のため省略）
    return NextResponse.json({ id: user.id, username: user.username });
  } catch (err: any) {
    console.error('API /api/login error:', err);
    return NextResponse.json({ error: err?.message || 'サーバーエラー' }, { status: 500 });
  }
}
