# simplechat

## 概要
Next.js（TypeScript）＋Supabase PostgreSQL（Docker永続化対応）構成のX（旧Twitter）風SNSアプリです。

- 投稿は文字のみ
- いいね・返信・削除機能あり
- ユーザーはユーザー名・パスワードのみで登録
- 検索・並び替え・ジャンプ機能あり
- スタイリッシュなUI（Tailwind CSS）
- APIルートで認証・投稿・いいね・返信・削除を実装
- Vercelデプロイ前提

## 本番デプロイURL
[https://simple-chat-ten-sable.vercel.app/](https://simple-chat-ten-sable.vercel.app/)

## ローカル開発手順

1. リポジトリをクローン

```
git clone <このリポジトリのURL>
cd simplechat
```

2. 必要な環境変数を設定（.env.local）

```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?pgbouncer=true
```

3. 依存パッケージをインストール

```
npm install
```

4. Prismaマイグレーション（DB初期化）

```
npx prisma migrate deploy
```

5. 開発サーバー起動

```
npm run dev
```

6. ブラウザで `http://localhost:3000` にアクセス

## 本番デプロイ（Vercel）

- Vercelの環境変数に `DATABASE_URL` を設定
- SupabaseのNetwork RestrictionsでVercelのIPを許可
- Vercelでデプロイ

## 技術スタック
- Next.js (App Router, TypeScript)
- Prisma ORM
- Supabase PostgreSQL
- Tailwind CSS
- Docker（ローカルDB永続化用）

## 機能一覧
- ユーザー登録・ログイン（ユーザー名・パスワード）
- 投稿（テキストのみ）
- いいね・いいね解除
- 返信
- 投稿削除
- 検索・並び替え・ジャンプ
- レスポンシブ＆モダンUI

## ライセンス
MIT
