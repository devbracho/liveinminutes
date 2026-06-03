import type { Role } from "@/lib/auth/role-constants";

export type AdminActionState = {
  error?: string;
  success?: string;
};

export type AdminUser = {
  id: string;
  email: string;
  createdAt: Date;
  banned: boolean;
  role: Role;
  isPremium: boolean;
};
