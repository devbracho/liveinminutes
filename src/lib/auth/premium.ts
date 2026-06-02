import { getProfileAccess, hasPremiumAccess } from "@/lib/auth/roles";

export async function getUserPremiumStatus(): Promise<boolean> {
  const access = await getProfileAccess();
  return hasPremiumAccess(access);
}

export type PremiumDetails = {
  isPremium: boolean;
  expiresAt: Date | null;
  isLifetime: boolean;
};

export async function getUserPremiumDetails(): Promise<PremiumDetails> {
  const access = await getProfileAccess();

  if (!hasPremiumAccess(access)) {
    return { isPremium: false, expiresAt: access?.premiumExpiresAt ?? null, isLifetime: false };
  }

  const roleBased = access?.role === "premium" || access?.role === "admin";
  const expiresAt = access?.premiumExpiresAt ?? null;

  return { isPremium: true, expiresAt, isLifetime: roleBased || expiresAt === null };
}
