"use client";

import { CalendarPlus, Trash2, X } from "lucide-react";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Booking } from "@/lib/db/schema";
import { cancelBooking, createBooking, deleteBooking } from "./actions";

function formatWhen(date: Date | string) {
  return new Date(date).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function defaultStart() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookingManager({ initialBookings }: { initialBookings: Booking[] }) {
  const [isPending, startTransition] = useTransition();

  const now = Date.now();
  const upcoming = initialBookings.filter(
    (b) => b.status === "confirmed" && new Date(b.startsAt).getTime() >= now,
  );
  const past = initialBookings.filter(
    (b) => b.status === "cancelled" || new Date(b.startsAt).getTime() < now,
  );

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createBooking(formData);
    });
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      await cancelBooking(id);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteBooking(id);
    });
  }

  return (
    <div className="mt-6 space-y-8">
      <form action={handleCreate} className="space-y-4 rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarPlus className="size-4 text-primary" />
          New appointment
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Title</Label>
            <Input id="name" name="name" placeholder="Haircut with Sam" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startsAt">Date and time</Label>
            <Input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={defaultStart()}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={15}
              max={480}
              step={15}
              defaultValue={30}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" placeholder="Anything to remember" />
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          Book it
        </Button>
      </form>

      <section>
        <h2 className="text-sm font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No upcoming appointments.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(b.startsAt)} · {b.durationMinutes} min
                    {b.note ? ` · ${b.note}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1 text-muted-foreground hover:text-destructive"
                  onClick={() => handleCancel(b.id)}
                  disabled={isPending}
                >
                  <X className="size-4" />
                  Cancel
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground">Past and cancelled</h2>
          <ul className="mt-3 space-y-2">
            {past.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm opacity-70"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    {b.name}
                    {b.status === "cancelled" ? (
                      <Badge variant="secondary" className="text-xs">
                        Cancelled
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatWhen(b.startsAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(b.id)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
