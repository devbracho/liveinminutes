"use client";

import { Clock, LogIn, LogOut } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TimeEntry } from "@/lib/db/schema";
import { clockIn, clockOut } from "./actions";

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

function durationMs(start: Date | string, end: Date | string) {
  return new Date(end).getTime() - new Date(start).getTime();
}

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function TimeClock({
  initialEntries,
  initialOpen,
}: {
  initialEntries: TimeEntry[];
  initialOpen: TimeEntry | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());

  const isClockedIn = initialOpen !== null;

  useEffect(() => {
    if (!isClockedIn) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isClockedIn]);

  const completed = initialEntries.filter((entry) => entry.clockOut !== null);
  const totalMs = completed.reduce(
    (sum, entry) => sum + durationMs(entry.clockIn, entry.clockOut as Date),
    0,
  );

  function handleClockIn(formData: FormData) {
    startTransition(async () => {
      await clockIn(formData);
    });
  }

  function handleClockOut() {
    startTransition(async () => {
      await clockOut();
    });
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4 text-primary" />
            Current status
          </div>
          <Badge variant={isClockedIn ? "default" : "secondary"}>
            {isClockedIn ? "Clocked in" : "Clocked out"}
          </Badge>
        </div>

        {isClockedIn && initialOpen ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Since {formatTime(initialOpen.clockIn)}
              {initialOpen.note ? ` · ${initialOpen.note}` : ""}
            </p>
            <p className="font-mono text-3xl font-bold tabular-nums">
              {formatDuration(now - new Date(initialOpen.clockIn).getTime())}
            </p>
            <Button onClick={handleClockOut} disabled={isPending} className="gap-2">
              <LogOut className="size-4" />
              Clock out
            </Button>
          </div>
        ) : (
          <form action={handleClockIn} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              name="note"
              placeholder="What are you working on? (optional)"
              className="flex-1"
            />
            <Button type="submit" disabled={isPending} className="gap-2">
              <LogIn className="size-4" />
              Clock in
            </Button>
          </form>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent shifts</h2>
          <span className="text-xs text-muted-foreground">
            Total logged: {formatDuration(totalMs)}
          </span>
        </div>

        {initialEntries.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No shifts yet. Clock in to start tracking.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {initialEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {formatDate(entry.clockIn)} · {formatTime(entry.clockIn)} to{" "}
                    {entry.clockOut ? formatTime(entry.clockOut) : "in progress"}
                  </p>
                  {entry.note ? (
                    <p className="truncate text-xs text-muted-foreground">{entry.note}</p>
                  ) : null}
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {entry.clockOut
                    ? formatDuration(durationMs(entry.clockIn, entry.clockOut))
                    : "--"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
