import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DemoLinks } from "@/app/demos/_components/demo-links";
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
      <DemoLinks guide="/guides/build-appointment-booking" skill="booking" />
      <BookingManager initialBookings={all} />
    </main>
  );
}
