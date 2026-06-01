"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Plan = "monthly" | "lifetime";

async function startCheckout(plan: Plan): Promise<string> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Could not start checkout.");
  }
  return data.url;
}

export function UpgradeButtons() {
  const [pending, setPending] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(plan: Plan) {
    setError(null);
    setPending(plan);
    try {
      window.location.href = await startCheckout(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card px-6 py-8 text-left">
          <p className="text-sm font-medium text-muted-foreground">Monthly</p>
          <p className="mt-1 text-3xl font-bold">
            $5<span className="text-base font-normal text-muted-foreground">/30 days</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pay in crypto, get 30 days. Pay again to extend.
          </p>
          <Button
            className="mt-6 w-full"
            disabled={pending !== null}
            onClick={() => handleClick("monthly")}
          >
            {pending === "monthly" ? "Redirecting..." : "Pay with crypto"}
          </Button>
        </div>

        <div className="rounded-xl border border-primary bg-card px-6 py-8 text-left">
          <p className="text-sm font-medium text-primary">Lifetime</p>
          <p className="mt-1 text-3xl font-bold">
            $9<span className="text-base font-normal text-muted-foreground"> once</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Pay once in crypto, keep forever.</p>
          <Button
            className="mt-6 w-full"
            disabled={pending !== null}
            onClick={() => handleClick("lifetime")}
          >
            {pending === "lifetime" ? "Redirecting..." : "Buy lifetime"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
