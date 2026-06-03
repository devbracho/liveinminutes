import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";
import { BookingManager } from "./booking-manager";

export const metadata: Metadata = {
  title: "Appointment Booking · Demos",
};

export default async function BookingPage() {
  const user = await getUser();
  if (!user) redirect("/login?from=/demos/booking");

  const all = await db
    .select()
    .from(bookings)
    .where(eq(bookings.userId, user.id))
    .orderBy(asc(bookings.startsAt));

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Appointment Booking</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Schedule appointments, then confirm or cancel them. Server Actions + Drizzle + Zod
        validation + RLS so each account manages only its own bookings.
      </p>
      <Link
        href="/guides/build-appointment-booking"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        See how to get live in minutes →
      </Link>
      <BookingManager initialBookings={all} />
    </main>
  );
}
