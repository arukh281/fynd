**Fynd — Task 2: Review Dashboard with Server-side LLM**

A production-style web application providing a public review submission dashboard and an internal admin dashboard, with server-side LLMs (llama-3.1-8B via OpenRouter) for review summarization and action recommendations.

**Features Overview**

- **Public Review Submission:** Users submit a rating (1–5) and a text review; receives an AI-generated response.
- **Admin Dashboard:** Internal view showing all submissions, AI summaries, and recommended actions for each review.
- **Server-side LLM usage:** Calls to `meta-llama/llama-3.1-8b-instruct` via OpenRouter performed on the server for both user-facing and admin-facing outputs.
- **Persistence:** Reviews are stored in PostgreSQL (via Prisma) for shared access between dashboards.
- **Live Admin View:** Admin dashboard updates automatically (polling/live refresh) to surface new submissions quickly.

**System Architecture**

- **Frontend + Backend:** Next.js (app router) handles both UI and API routes server-side.
- **Database:** PostgreSQL managed through Prisma as the ORM and schema layer.
- **LLM Provider:** OpenRouter calling `meta-llama/llama-3.1-8b-instruct` (see `src/lib/llm.ts`).
- **Deployment Targets (recommended):** Vercel for the Next.js app and Render/Supabase for PostgreSQL. (See Deployment Details below.)

**User Dashboard (Public-Facing)**

- **What users can do:** Select a rating (1–5) and submit a textual review.
- **Post-submission:** The server stores the review and returns a short AI-generated response to the user.
- **Validation & errors:** Client-side validation prevents empty submissions and enforces a max length; server validates the same. Clear success and error states are shown to the user when requests succeed or fail.

**Admin Dashboard (Internal-Facing)**

- **What admins see:** A list of all submissions with rating, full review text, an AI-generated summary, and recommended next-step actions.
- **AI outputs:** Each item includes a concise admin summary and suggested actions (e.g., follow-up, escalate, ignore).
- **Data updates:** Admin UI polls the shared database / API for changes (auto-refresh). The dashboard reads directly from the same PostgreSQL dataset used by the public submission route.

**AI & Prompt Design**

- **Roles for the LLM:**
	- User-facing response: friendly acknowledgement, brief follow-up suggestions.
	- Admin summary: concise, factual summary highlighting main points and sentiment.
	- Admin recommended actions: short, prioritized action items grounded in the review content.
- **Prompting approach:** Prompts designed to be concise and grounded; instructions explicitly ask the model to avoid inventing facts and to answer from the review text only.
- **Guardrails:** System instructs the LLM to respond only with evidence-based summaries and to flag when the review is too short or ambiguous for a useful recommendation.

**API Design & Error Handling**

- **Key API routes (server-side Next.js app router):**
	- `POST /api/submit-review` — Accepts `{ rating: number, review: string }`, returns `{ success: boolean, aiResponse?: string, id?: string, error?: string }`.
	- `GET /api/admin/reviews` — Returns a JSON list of submissions including `id, rating, review, aiSummary, aiActions, createdAt`.
	- `POST /api/test-llm` — Internal/dev endpoint used to validate LLM responses.
- **Error cases handled:**
	- Empty review submissions return a 400 with a clear message.
	- Reviews exceeding the configured max length return a 413 or structured validation error.
	- LLM/network failures return a 502 with a friendly fallback message; failures are logged server-side for investigation.

**Deployment Details**

- **Current status:** Not deployed to a public URL in this repository snapshot.
- **How to deploy:** Recommended: deploy the Next.js app to Vercel and the PostgreSQL database to Render or Supabase. Ensure `DATABASE_URL` and `OPENROUTER_API_KEY` are set in the deployment environment.
- **Access URLs:** Not available for this commit — add public URLs here once deployed.

**Local Setup (Quick)**

1. Ensure you have a PostgreSQL instance and set `DATABASE_URL`.
2. Obtain an OpenRouter API key and set `OPENROUTER_API_KEY`.

Environment variables required:

- `DATABASE_URL` — PostgreSQL connection string.
- `OPENROUTER_API_KEY` — OpenRouter API key for llama-3.1-8B calls.

Commands:

```bash
npm install
npm run dev
```

**Notes & Known Limitations**

- Admin dashboard currently uses polling/auto-refresh rather than WebSockets — chosen for simplicity and scope.
- No authentication is implemented for the admin dashboard in this iteration (out of scope) — do not expose the admin UI publicly without adding auth.
- LLM costs and rate limits are not handled beyond basic error responses; consider caching or batching for production.

---

If you'd like, I can:

- Add deployment steps for Vercel + Render/Supabase and include an example `vercel.json`.
- Implement a simple auth guard for the admin dashboard.

File references:

- Main LLM helper: [src/lib/llm.ts](src/lib/llm.ts)
- API routes: [src/app/api](src/app/api)

