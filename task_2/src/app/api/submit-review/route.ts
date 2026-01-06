import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLlama } from "@/lib/llm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rating, review } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating" },
        { status: 400 }
      );
    }

    if (!review || review.trim().length === 0) {
      return NextResponse.json(
        { error: "Review cannot be empty" },
        { status: 400 }
      );
    }

    if (review.length > 2000) {
      return NextResponse.json(
        { error: "Review too long" },
        { status: 400 }
      );
    }

    // LLM prompts
    const userPrompt = `
You are writing a customer-facing reply on behalf of a business.

Rules:
- Write the response as the business.
- Do NOT use placeholders like [User], [Customer], or [Business Name].
- Do NOT mention AI or analysis.
- Do NOT explain your reasoning.
- Keep it concise (1–2 sentences).
- Match tone to the rating.
- If rating is low, be apologetic and empathetic.
- If rating is high, be appreciative and warm.

User rating: ${rating}
User review: ${review}
`;


    const summaryPrompt = `
You are generating a summary for an internal admin dashboard.

Rules:
- Do NOT paraphrase obvious or trivial content.
- If the review contains only generic praise (e.g. "good", "nice", "great") with no specifics,
  return exactly:
  "Generic positive feedback with no actionable details."
- Otherwise return max 2 bullet points.
- No explanations.

Rating: ${rating}
Review: ${review}
`;




    const actionPrompt = `
You are generating internal admin actions.

Rules:
- No introductions.
- No vague actions (e.g. "verify satisfaction").
- Actions must be concrete and operational.
- If rating is 4 or 5 and review is generic:
  focus on monitoring, amplification, or feedback collection.
- Max 3 bullet points.
- One sentence per bullet.

Rating: ${rating}
Review: ${review}
`;





    const [aiResponse, aiSummary, aiActions] = await Promise.all([
      callLlama(userPrompt),
      callLlama(summaryPrompt),
      callLlama(actionPrompt),
    ]);

    // Save to DB
    const saved = await prisma.review.create({
      data: {
        rating,
        userReview: review,
        aiResponse,
        aiSummary,
        aiActions,
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
