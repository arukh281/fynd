"use client";

import { useState } from "react";

export default function Home() {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  async function submitReview() {
    setLoading(true);
    setError("");
    setAiResponse("");

    try {
      const res = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setAiResponse(data.data.aiResponse);
      setReview("");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-center">
      <header className="mb-6 text-center">
        <h1 className="text-4xl hero-title">Share your experience</h1>
        <p className="text-sm muted mt-2">Tell us what happened and we'll summarize with helpful suggestions.</p>
      </header>

      <section className="review-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium muted">Overall rating</div>
            <div className="mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  className={"star-btn " + (s <= rating ? "active" : "")}
                  onClick={() => setRating(s)}
                  aria-label={`Set rating ${s}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="rating-pill">{rating} ★</div>
          </div>
        </div>

        <label>
          <div className="text-sm font-medium muted">Your review</div>
          <textarea
            className="review-textarea mt-2"
            rows={6}
            placeholder="What went well? What could be improved? Be specific—this helps us and other customers."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </label>

        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={submitReview}
            disabled={loading}
            className="submit-cta"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {aiResponse && (
          <div className="ai-response">
            <h2 className="text-lg font-semibold">AI Summary & Suggestions</h2>
            <div className="mt-2">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(aiResponse) }} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

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
