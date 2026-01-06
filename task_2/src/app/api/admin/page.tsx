"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  rating: number;
  userReview: string;
  aiSummary: string;
  aiActions: string;
  createdAt: string;
};

export default function AdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReviews() {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  function escapeHtml(unsafe: string) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function markdownToHtml(s: string) {
    if (!s) return "";
    let out = escapeHtml(s);
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    const lines = out.split(/\r?\n/);
    const parts: string[] = [];
    let inList = false;
    for (const line of lines) {
      const m = line.match(/^\s*\d+\.\s+(.*)$/);
      if (m) {
        if (!inList) {
          parts.push('<ol class="ml-5 list-decimal">');
          inList = true;
        }
        parts.push(`<li>${m[1]}</li>`);
      } else {
        if (inList) {
          parts.push("</ol>");
          inList = false;
        }
        if (line.trim() === "") {
          parts.push("<p></p>");
        } else {
          parts.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) parts.push("</ol>");
    return parts.join("");
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of recent reviews and AI suggestions</p>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {reviews.map((r) => (
          <article key={r.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow hover:shadow-lg transition-shadow p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Review</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{r.userReview}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-600 text-white text-sm font-medium">{r.rating} ★</span>
                <time className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleString()}</time>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Summary</h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(r.aiSummary) }} />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recommended Actions</h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(r.aiActions) }} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
