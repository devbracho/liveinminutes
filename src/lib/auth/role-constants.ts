export const ROLES = ["user", "premium", "admin"] as const;
export type Role = (typeof ROLES)[number];
