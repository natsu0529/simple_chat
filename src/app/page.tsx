"use client";
import { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
}
interface Post {
  id: number;
  content: string;
  author: User;
  likes: any[];
  replies: any[];
  createdAt: string;
  deleted: boolean;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  }

  async function handleRegister() {
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) setUser(data);
    setLoading(false);
  }

  async function handleLogin() {
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) setUser(data);
    setLoading(false);
  }

  async function handlePost() {
    if (!user) return;
    setLoading(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, authorId: user.id }),
    });
    setContent("");
    await fetchPosts();
    setLoading(false);
  }

  async function handleDelete(postId: number) {
    setLoading(true);
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    await fetchPosts();
    setLoading(false);
  }

  async function handleLike(postId: number) {
    if (!user) return;
    setLoading(true);
    await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, postId }),
    });
    await fetchPosts();
    setLoading(false);
  }

  async function handleUnlike(postId: number) {
    if (!user) return;
    setLoading(true);
    await fetch("/api/like", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, postId }),
    });
    await fetchPosts();
    setLoading(false);
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">simplechat</h1>
      {!user ? (
        <div className="mb-4 flex gap-2">
          <input
            className="border px-2 py-1"
            placeholder="ユーザー名"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className="border px-2 py-1"
            placeholder="パスワード"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleLogin} disabled={loading}>ログイン</button>
          <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={handleRegister} disabled={loading}>新規登録</button>
        </div>
      ) : (
        <div className="mb-4 flex gap-2 items-center">
          <span>ログイン中: <b>{user.username}</b></span>
          <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setUser(null)}>ログアウト</button>
        </div>
      )}
      {user && (
        <div className="mb-4 flex gap-2">
          <input
            className="border px-2 py-1 flex-1"
            placeholder="いまどうしてる？"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handlePost} disabled={loading || !content}>投稿</button>
        </div>
      )}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="border rounded p-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="font-bold">{post.author.username}</span>
              <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <div className="my-2 whitespace-pre-wrap">{post.content}</div>
            <div className="flex gap-2 items-center">
              <button
                className="text-pink-500"
                onClick={() => handleLike(post.id)}
                disabled={loading || !user}
              >
                ♥ {post.likes.length}
              </button>
              <button
                className="text-gray-400"
                onClick={() => handleUnlike(post.id)}
                disabled={loading || !user}
              >
                いいね解除
              </button>
              {user && user.id === post.author.id && (
                <button
                  className="text-red-500"
                  onClick={() => handleDelete(post.id)}
                  disabled={loading}
                >
                  削除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
