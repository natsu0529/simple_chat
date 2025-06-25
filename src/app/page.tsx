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
interface Reply {
  id: number;
  content: string;
  author: User;
  createdAt: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});
  const [replying, setReplying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
    } else {
      setError(data.error || "登録に失敗しました");
    }
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

  async function handleReply(postId: number) {
    if (!user || !replyContent[postId]) return;
    setLoading(true);
    await fetch("/api/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent[postId], authorId: user.id, postId }),
    });
    setReplyContent(c => ({ ...c, [postId]: "" }));
    setReplying(null);
    await fetchPosts();
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-wine-dark via-wine to-wine-light flex flex-col items-center justify-start py-12 px-2">
      <div className="w-full max-w-2xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-wine/30 backdrop-blur-md">
        <h1 className="text-5xl font-extrabold text-wine drop-shadow-lg tracking-widest mb-10 text-center font-montserrat">simplechat</h1>
        {!user ? (
          <>
            {error && (
              <div className="mb-4 text-center text-red-700 font-bold bg-red-100 border border-red-300 rounded-lg p-3 animate-pulse shadow">{error}</div>
            )}
            <div className="mb-6 flex gap-3 flex-wrap justify-center">
              <input
                className="border-2 border-wine rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine-light transition w-52 bg-wine-pale placeholder-wine-dark/60 text-wine-dark font-semibold shadow-sm"
                placeholder="ユーザー名"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <input
                className="border-2 border-wine-light rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine transition w-52 bg-wine-pale placeholder-wine-dark/60 text-wine-dark font-semibold shadow-sm"
                placeholder="パスワード"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button className="bg-wine hover:bg-wine-light text-white font-bold px-5 py-2 rounded-xl shadow transition duration-150 active:scale-95" onClick={handleLogin} disabled={loading}>ログイン</button>
              <button className="bg-wine-light hover:bg-wine text-white font-bold px-5 py-2 rounded-xl shadow transition duration-150 active:scale-95" onClick={handleRegister} disabled={loading}>新規登録</button>
            </div>
          </>
        ) : (
          <div className="mb-8 flex gap-4 items-center justify-center">
            <span className="text-lg font-semibold text-wine-dark bg-wine-pale px-4 py-2 rounded-xl shadow">ログイン中: <b className="text-wine">{user.username}</b></span>
            <button className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 transition font-bold shadow" onClick={() => setUser(null)}>ログアウト</button>
          </div>
        )}
        {user && (
          <div className="mb-8 flex gap-4 justify-center items-center">
            <input
              className="border-2 border-wine-pale rounded-xl px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-wine transition bg-wine-pale placeholder-wine-dark/60 text-wine-dark font-semibold shadow-sm"
              placeholder="いまどうしてる？"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <button className="bg-wine hover:bg-wine-light text-white font-bold px-6 py-2 rounded-xl shadow transition duration-150 active:scale-95" onClick={handlePost} disabled={loading || !content}>投稿</button>
          </div>
        )}
        <div className="space-y-8">
          {posts.map(post => (
            <div key={post.id} className="post-card bg-white border border-wine/10 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xl text-wine flex items-center gap-2"><svg width="18" height="18" fill="currentColor" className="inline-block"><circle cx="9" cy="9" r="8" className="text-wine-light" fill="#b2455e" /></svg>{post.author.username}</span>
                <span className="text-xs text-wine-dark/60 font-mono">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <div className="my-4 whitespace-pre-wrap text-lg text-wine-dark font-medium tracking-wide">{post.content}</div>
              <div className="flex gap-4 items-center mb-2">
                <button
                  className="text-wine font-bold hover:scale-125 hover:text-wine-light transition duration-150 flex items-center gap-1"
                  onClick={() => handleLike(post.id)}
                  disabled={loading || !user}
                >
                  <span className="text-2xl">♥</span> {post.likes.length}
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600 transition font-semibold"
                  onClick={() => handleUnlike(post.id)}
                  disabled={loading || !user}
                >
                  いいね解除
                </button>
                {user && user.id === post.author.id && (
                  <button
                    className="text-red-500 hover:text-red-700 transition font-bold"
                    onClick={() => handleDelete(post.id)}
                    disabled={loading}
                  >
                    削除
                  </button>
                )}
                {user && (
                  <button
                    className="text-wine hover:text-wine-light transition font-bold"
                    onClick={() => setReplying(replying === post.id ? null : post.id)}
                    disabled={loading}
                  >
                    返信
                  </button>
                )}
              </div>
              {/* 返信入力欄 */}
              {user && replying === post.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    className="border-2 border-wine rounded-xl px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-wine-light transition bg-wine-pale placeholder-wine-dark/60 text-wine-dark font-semibold shadow-sm"
                    placeholder="返信を入力..."
                    value={replyContent[post.id] || ""}
                    onChange={e => setReplyContent(c => ({ ...c, [post.id]: e.target.value }))}
                    disabled={loading}
                  />
                  <button
                    className="bg-wine hover:bg-wine-light text-white font-bold px-5 py-2 rounded-xl shadow transition duration-150 active:scale-95"
                    onClick={() => handleReply(post.id)}
                    disabled={loading || !(replyContent[post.id] || "").trim()}
                  >
                    送信
                  </button>
                </div>
              )}
              {/* 返信表示 */}
              {post.replies && post.replies.length > 0 && (
                <div className="reply-thread bg-wine-pale border-l-4 border-wine-light rounded-lg mt-3 p-3">
                  {post.replies.map((reply: Reply) => (
                    <div key={reply.id} className="text-sm mb-2">
                      <span className="font-bold text-wine mr-2">{reply.author.username}</span>
                      <span className="text-wine-dark whitespace-pre-wrap mr-2">{reply.content}</span>
                      <span className="text-xs text-wine-dark/50 font-mono">{new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
