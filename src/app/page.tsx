"use client";
import { useState, useEffect, useRef } from "react";

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
interface SearchResult {
  type: 'post' | 'reply';
  id: number;
  content: string;
  user: string;
  postId?: number;
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
  const [openReplies, setOpenReplies] = useState<{ [key: number]: boolean }>({});
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [sortType, setSortType] = useState<'like' | 'newestPost' | 'newestReply' | 'oldestPost' | 'oldestReply'>('newestPost');
  const postRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const replyRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
    } else {
      setError(data.error || "ログインに失敗しました");
    }
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

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    setShowResults(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setSearchResults(data.results || []);
    setSearching(false);
  }

  function scrollToResult(result: SearchResult) {
    setShowResults(false);
    if (result.type === 'post') {
      postRefs.current[result.id]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    } else if (result.type === 'reply' && result.postId) {
      setOpenReplies(r => {
        // 返信スレッドが閉じている場合のみ開く
        if (!r[result.postId!]) {
          setTimeout(() => {
            replyRefs.current[result.id]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }, 300); // スレッド展開後にスクロール
          return { ...r, [result.postId!]: true };
        } else {
          // 既に開いていれば即スクロール
          setTimeout(() => {
            replyRefs.current[result.id]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }, 0);
          return r;
        }
      });
    }
  }

  function sortPosts(posts: Post[]): Post[] {
    switch (sortType) {
      case 'like':
        return [...posts].sort((a, b) => b.likes.length - a.likes.length);
      case 'newestPost':
        return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldestPost':
        return [...posts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'newestReply':
        return [...posts].sort((a, b) => {
          const aLatest = a.replies.length ? new Date(a.replies[a.replies.length-1].createdAt).getTime() : 0;
          const bLatest = b.replies.length ? new Date(b.replies[b.replies.length-1].createdAt).getTime() : 0;
          return bLatest - aLatest;
        });
      case 'oldestReply':
        return [...posts].sort((a, b) => {
          const aOldest = a.replies.length ? new Date(a.replies[0].createdAt).getTime() : Infinity;
          const bOldest = b.replies.length ? new Date(b.replies[0].createdAt).getTime() : Infinity;
          return aOldest - bOldest;
        });
      default:
        return posts;
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-wine-dark via-wine to-wine-light flex flex-col items-center justify-center py-10 px-2">
      <div className="w-full max-w-2xl p-0 overflow-hidden">
        {/* 検索バー */}
        <form onSubmit={handleSearch} className="w-full flex items-center gap-2 px-6 py-4 bg-white/80 border-b border-wine/10 sticky top-0 z-20">
          <input
            className="flex-1 px-4 py-2 rounded-full border border-wine/20 bg-wine-pale text-wine-dark font-semibold focus:outline-none focus:ring-2 focus:ring-wine-light transition shadow-sm"
            placeholder="投稿・返信を検索..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              if (e.target.value === "") {
                setShowResults(false);
                setSearchResults([]);
              }
            }}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          <button type="submit" className="bg-wine text-white font-bold px-5 py-2 rounded-full shadow hover:bg-wine-light transition" disabled={searching}>検索</button>
        </form>
        {/* 検索結果ドロップダウン */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-full max-w-2xl bg-white border border-wine/20 rounded-2xl shadow-lg z-30 max-h-80 overflow-y-auto">
            {searchResults.map(r => (
              <button
                key={r.type + r.id}
                className="w-full text-left px-6 py-3 hover:bg-wine-pale/60 transition flex flex-col gap-1 border-b border-wine/10 last:border-b-0"
                onClick={() => scrollToResult(r)}
              >
                <span className="font-bold text-wine text-base">{r.type === 'post' ? '投稿' : '返信'} by {r.user}</span>
                <span className="text-wine-dark text-sm line-clamp-2">{r.content}</span>
                <span className="text-xs text-wine-dark/50 font-mono">{new Date(r.createdAt).toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
        {/* ヘッダー */}
        <header className="bg-gradient-to-r from-wine-dark via-wine to-wine-light py-8 px-6 flex flex-col items-center gap-2 shadow-md">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg tracking-widest font-montserrat select-none text-center">simplechat</h1>
        </header>
        <div className="p-8 flex flex-col items-center">
        {/* 認証・投稿欄 */}
        {!user ? (
          <>
            {error && (
              <div className="mb-4 text-center text-red-700 font-bold bg-red-100 border border-red-300 rounded-lg p-3 animate-pulse shadow">{error}</div>
            )}
            <div className="mb-6 flex gap-3 flex-wrap justify-center items-center">
              <input
                className="border-2 border-wine rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine-light transition w-52 bg-wine-pale placeholder-wine-dark/60 text-wine-dark font-semibold shadow-sm text-center"
                placeholder="ユーザー名"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <input
                className="border-2 border-wine-light rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-wine transition w-52 bg-wine-pale placeholder-wine-dark/60 text-wine-dark font-semibold shadow-sm text-center"
                placeholder="パスワード"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button className="bg-gradient-to-r from-wine to-wine-light hover:from-wine-light hover:to-wine text-white font-bold px-5 py-2 rounded-xl shadow transition duration-150 active:scale-95" onClick={handleLogin} disabled={loading}>ログイン</button>
              <button className="bg-gradient-to-r from-wine-light to-wine hover:from-wine hover:to-wine-light text-white font-bold px-5 py-2 rounded-xl shadow transition duration-150 active:scale-95" onClick={handleRegister} disabled={loading}>新規登録</button>
            </div>
          </>
        ) : (
          <div className="mb-8 flex gap-4 items-center justify-center">
            <span className="text-lg font-semibold text-wine-dark bg-wine-pale px-4 py-2 rounded-xl shadow flex items-center gap-2 text-center"><svg width='20' height='20' fill='currentColor'><circle cx='10' cy='10' r='9' fill='#b2455e'/></svg>ログイン中: <b className="text-wine">{user.username}</b></span>
            <button className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 transition font-bold shadow" onClick={() => setUser(null)}>ログアウト</button>
          </div>
        )}
        {user && (
          <div className="mb-8 flex gap-4 justify-center items-center">
            <input
              className="border-2 border-wine-pale rounded-xl px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-wine transition bg-wine-pale placeholder-wine-dark/60 text-wine-dark font-semibold shadow-sm text-center"
              placeholder="いまどうしてる？"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <button className="bg-gradient-to-r from-wine to-wine-light hover:from-wine-light hover:to-wine text-white font-bold px-6 py-2 rounded-xl shadow transition duration-150 active:scale-95" onClick={handlePost} disabled={loading || !content}>投稿</button>
          </div>
        )}
        {/* ソート選択 */}
        <div className="w-full flex justify-end items-center gap-2 px-6 py-2">
          <label className="text-wine-dark font-semibold">並び順:</label>
          <select
            className="rounded-full border border-wine/20 bg-wine-pale text-wine-dark font-semibold px-4 py-1 focus:outline-none focus:ring-2 focus:ring-wine-light shadow-sm"
            value={sortType}
            onChange={e => setSortType(e.target.value as any)}
          >
            <option value="like">いいね数順</option>
            <option value="newestPost">投稿の最新順</option>
            <option value="newestReply">返信の最新順</option>
            <option value="oldestPost">投稿の最古順</option>
            <option value="oldestReply">返信の最古順</option>
          </select>
        </div>
        {/* 投稿一覧 */}
        <div className="w-full flex flex-row flex-wrap gap-8 items-stretch justify-start overflow-x-auto pb-4" style={{scrollbarWidth:'thin'}}>
          {sortPosts(posts).map(post => (
            <div key={post.id} ref={el => { postRefs.current[post.id] = el; }} className="post-card bg-white/70 border border-wine/10 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition backdrop-blur-md relative overflow-hidden flex flex-col items-center min-w-[320px] max-w-xs" style={{boxShadow:'0 4px 16px 0 rgba(123,41,78,0.10)'}}>
              <div className="flex flex-col items-center mb-2 w-full">
                <span className="font-bold text-xl text-wine flex items-center gap-2 text-center"><svg width="18" height="18" fill="currentColor" className="inline-block"><circle cx="9" cy="9" r="8" className="text-wine-light" fill="#b2455e" /></svg>{post.author.username}</span>
                <span className="text-xs text-wine-dark/60 font-mono text-center">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <div className="my-4 whitespace-pre-wrap text-lg text-wine-dark font-medium tracking-wide text-center w-full break-words">{post.content}</div>
              <div className="flex gap-4 items-center mb-2 justify-center w-full">
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
                <div className="mt-3 flex gap-2 w-full justify-center">
                  <input
                    className="border-2 border-wine rounded-xl px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-wine-light transition bg-wine-pale placeholder-wine-dark/60 text-wine-dark font-semibold shadow-sm text-center"
                    placeholder="返信を入力..."
                    value={replyContent[post.id] || ""}
                    onChange={e => setReplyContent(c => ({ ...c, [post.id]: e.target.value }))}
                    disabled={loading}
                  />
                  <button
                    className="bg-gradient-to-r from-wine to-wine-light hover:from-wine-light hover:to-wine text-white font-bold px-5 py-2 rounded-xl shadow transition duration-150 active:scale-95"
                    onClick={() => handleReply(post.id)}
                    disabled={loading || !(replyContent[post.id] || "").trim()}
                  >
                    送信
                  </button>
                </div>
              )}
              {/* 返信表示切り替えUI */}
              {post.replies && post.replies.length > 0 && (
                <div className="w-full flex flex-col items-center mt-2">
                  <span className="text-sm text-wine-dark/70 mb-1">返信 {post.replies.length}件</span>
                  <button
                    className="text-xs text-wine bg-wine-pale px-3 py-1 rounded-full shadow hover:bg-wine-light hover:text-white transition font-bold"
                    onClick={() => setOpenReplies(r => ({ ...r, [post.id]: !r[post.id] }))}
                  >
                    {openReplies[post.id] ? '返信を閉じる' : '返信を見る'}
                  </button>
                </div>
              )}
              {/* 返信スレッド本体 */}
              {post.replies && post.replies.length > 0 && openReplies[post.id] && (
                <div className="reply-thread bg-wine-pale/80 border-l-4 border-wine-light rounded-xl mt-3 p-4 flex flex-col gap-3 items-center w-full">
                  {post.replies.map((reply: Reply) => (
                    <div key={reply.id} ref={el => { replyRefs.current[reply.id] = el; }} className="flex flex-col items-center gap-0.5 bg-white/80 rounded-lg px-4 py-2 shadow-sm border border-wine/10 relative before:content-[''] before:absolute before:-left-3 before:top-4 before:w-3 before:h-3 before:bg-wine-light before:rounded-full before:shadow-md w-full">
                      <span className="font-bold text-wine block mb-1 text-center w-full">{reply.author.username}</span>
                      <span className="text-wine-dark whitespace-pre-wrap block mb-1 text-center w-full">{reply.content}</span>
                      <span className="text-xs text-wine-dark/50 font-mono text-center w-full">{new Date(reply.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>
    </main>
  );
}
