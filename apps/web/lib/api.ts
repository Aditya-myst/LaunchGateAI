import type { DossierResponse, Review } from "./types";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getDemoReview(): Promise<Review> {
  const res = await fetch(`${API}/api/demo/review`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch demo review");
  }

  return await res.json();
}

export async function startDemoReview() {
  const res = await fetch(`${API}/api/demo/run`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to start demo review");
  }

  return await res.json();
}

export async function finalizeDemoReview() {
  const res = await fetch(`${API}/api/demo/finalize`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to finalize demo review");
  }

  return await res.json();
}

export async function resetDemoReview() {
  const res = await fetch(`${API}/api/demo/seed`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to reset demo review");
  }

  return await res.json();
}

export async function submitHumanDecision(
  reviewId: string,
  decision: string,
  reason: string
) {
  const res = await fetch(`${API}/api/reviews/${reviewId}/human-decision`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      decision,
      reason,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to submit human decision");
  }

  return await res.json();
}

export async function getDossier(reviewId: string): Promise<DossierResponse> {
  const res = await fetch(`${API}/api/reviews/${reviewId}/dossier`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dossier");
  }

  return await res.json();
}

export function dossierDownloadUrl(reviewId: string) {
  return `${API}/api/reviews/${reviewId}/dossier.md`;
}

export async function submitReviewContext(payload: {
  title: string;
  owner: string;
  target_launch: string;
  description: string;
  artifacts: Record<string, string>;
}) {
  const res = await fetch(`${API}/api/intake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to submit review context");
  }

  return await res.json();
}

export async function runDynamicBandReview() {
  const res = await fetch(`${API}/api/band/run-dynamic-review`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to run dynamic Band review");
  }

  return await res.json();
}
export async function getReviewHistory(): Promise<{
  items: {
    id: string;
    title: string;
    owner: string;
    target_launch: string;
    status: string;
    decision: string;
    risk_score: number;
    risk_level: string;
    finding_count: number;
    updated_at: string;
  }[];
}> {
  const res = await fetch(`${API}/api/reviews/history/list`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch review history");
  }

  return await res.json();
}
