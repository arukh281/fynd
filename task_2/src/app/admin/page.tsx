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
    <main className="container-center">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl hero-title">Admin Dashboard</h1>
          <p className="text-sm muted mt-1">Overview of recent reviews and AI suggestions</p>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {reviews.map((r) => (
          <article key={r.id} className="review-card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Review</h2>
                <p className="text-sm muted mt-1 whitespace-pre-wrap">{r.userReview}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="rating-pill">{r.rating} ★</div>
                <time className="text-xs muted mt-2">{new Date(r.createdAt).toLocaleString()}</time>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium">AI Summary</h3>
              <div className="ai-response mt-2 text-sm">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(r.aiSummary) }} />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium">Recommended Actions</h3>
              <div className="ai-response mt-2 text-sm">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(r.aiActions) }} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
