import { and, count, eq, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

async function StatCard({
  label,
  getValue,
}: {
  label: string;
  getValue: () => Promise<string | number>;
}) {
  const value = await getValue();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export async function TotalTasksStat({ userId }: { userId: string }) {
  return (
    <StatCard
      label="Total tasks"
      getValue={async () => {
        const [row] = await db
          .select({ value: count() })
          .from(tasks)
          .where(eq(tasks.userId, userId));
        return row?.value ?? 0;
      }}
    />
  );
}

export async function CompletedTasksStat({ userId }: { userId: string }) {
  return (
    <StatCard
      label="Completed"
      getValue={async () => {
        const [row] = await db
          .select({ value: count() })
          .from(tasks)
          .where(and(eq(tasks.userId, userId), eq(tasks.completed, true)));
        return row?.value ?? 0;
      }}
    />
  );
}

export async function PendingTasksStat({ userId }: { userId: string }) {
  return (
    <StatCard
      label="Pending"
      getValue={async () => {
        const [row] = await db
          .select({ value: count() })
          .from(tasks)
          .where(and(eq(tasks.userId, userId), eq(tasks.completed, false)));
        return row?.value ?? 0;
      }}
    />
  );
}

export async function CompletionRateStat({ userId }: { userId: string }) {
  return (
    <StatCard
      label="Completion rate"
      getValue={async () => {
        const [total] = await db
          .select({ value: count() })
          .from(tasks)
          .where(eq(tasks.userId, userId));
        const [done] = await db
          .select({ value: count() })
          .from(tasks)
          .where(and(eq(tasks.userId, userId), eq(tasks.completed, true)));
        const t = total?.value ?? 0;
        const d = done?.value ?? 0;
        return t === 0 ? "—" : `${Math.round((d / t) * 100)}%`;
      }}
    />
  );
}

export async function WeeklyTasksStat({ userId }: { userId: string }) {
  return (
    <StatCard
      label="Added this week"
      getValue={async () => {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [row] = await db
          .select({ value: count() })
          .from(tasks)
          .where(and(eq(tasks.userId, userId), gte(tasks.createdAt, since)));
        return row?.value ?? 0;
      }}
    />
  );
}
