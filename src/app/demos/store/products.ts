export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  requiresPremium?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "payments-kit",
    name: "Payments Kit",
    description: "NOWPayments crypto checkout with webhooks, IPN verification, and premium gating.",
    price: 15,
    emoji: "💳",
  },
  {
    id: "nextjs-starter",
    name: "Next.js Starter",
    description: "App Router + Tailwind + shadcn/ui, pre-wired and ready to ship.",
    price: 9,
    emoji: "⚡",
    requiresPremium: true,
  },
  {
    id: "auth-kit",
    name: "Auth Kit",
    description: "Supabase Auth with GitHub OAuth, magic links, and session handling.",
    price: 12,
    emoji: "🔐",
    requiresPremium: true,
  },
];
