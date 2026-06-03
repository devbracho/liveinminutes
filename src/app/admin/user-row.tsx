"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type AdminActionState, type AdminUser } from "@/lib/auth/admin-types";
import { ROLES } from "@/lib/auth/role-constants";
import { setPremiumById, setUserBannedById, setUserRoleById } from "@/lib/auth/admin";

const initialState: AdminActionState = {};

function relativeDate(d: Date) {
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1mo ago" : `${months}mo ago`;
}

export function UserRow({ user }: { user: AdminUser }) {
  const [roleState, roleAction] = useActionState(setUserRoleById, initialState);
  const [premiumState, premiumAction] = useActionState(setPremiumById, initialState);
  const [banState, banAction] = useActionState(setUserBannedById, initialState);

  const feedback =
    roleState.error ??
    premiumState.error ??
    banState.error ??
    roleState.success ??
    premiumState.success ??
    banState.success;

  return (
    <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors">
      {/* Email + joined */}
      <td className="py-3 px-4">
        <span className="text-sm font-medium">
          {user.email || <span className="text-muted-foreground italic">no email</span>}
        </span>
        <span className="ml-2 text-xs text-muted-foreground">{relativeDate(user.createdAt)}</span>
        {feedback && (
          <span
            className={`ml-2 text-xs ${(roleState.error ?? premiumState.error ?? banState.error) ? "text-destructive" : "text-primary"}`}
          >
            {feedback}
          </span>
        )}
      </td>

      {/* Status badges */}
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={
              user.role === "admin" ? "default" : user.role === "premium" ? "secondary" : "outline"
            }
            className="text-xs"
          >
            {user.role}
          </Badge>
          {user.isPremium && (
            <Badge variant="secondary" className="text-xs text-amber-600 border-amber-300">
              premium
            </Badge>
          )}
          {user.banned && (
            <Badge variant="destructive" className="text-xs">
              disabled
            </Badge>
          )}
        </div>
      </td>

      {/* Set role */}
      <td className="py-3 px-4">
        <form action={roleAction} className="flex items-center gap-2">
          <input type="hidden" name="userId" value={user.id} />
          <select
            name="role"
            defaultValue={user.role}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs px-2">
            Save
          </Button>
        </form>
      </td>

      {/* Premium toggle */}
      <td className="py-3 px-4">
        <form action={premiumAction}>
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="grant" value={user.isPremium ? "false" : "true"} />
          <Button
            type="submit"
            size="sm"
            variant={user.isPremium ? "outline" : "secondary"}
            className="h-8 text-xs px-2"
          >
            {user.isPremium ? "Revoke" : "Grant"}
          </Button>
        </form>
      </td>

      {/* Disable / Enable */}
      <td className="py-3 px-4">
        <form action={banAction}>
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="ban" value={user.banned ? "false" : "true"} />
          <Button
            type="submit"
            size="sm"
            variant={user.banned ? "outline" : "ghost"}
            className={`h-8 text-xs px-2 ${!user.banned ? "text-destructive hover:text-destructive" : ""}`}
          >
            {user.banned ? "Enable" : "Disable"}
          </Button>
        </form>
      </td>
    </tr>
  );
}
