export const BUSINESS_NAME = "Aura Coffee Roasters";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
};

export const CATALOG: Product[] = [
  {
    id: "house-blend",
    name: "House Blend (250g)",
    price: 12,
    description: "Smooth everyday medium roast. Notes of cocoa and hazelnut.",
  },
  {
    id: "ethiopia-single",
    name: "Ethiopia Single Origin (250g)",
    price: 18,
    description: "Bright, floral light roast with jasmine and citrus.",
  },
  {
    id: "decaf-dark",
    name: "Decaf Dark Roast (250g)",
    price: 14,
    description: "Swiss-water decaf, bold and chocolatey.",
  },
  {
    id: "cold-brew-kit",
    name: "Cold Brew Kit",
    price: 28,
    description: "Reusable filter, carafe, and 500g of coarse-ground beans.",
  },
];

export const SYSTEM_PROMPT = `You are the friendly WhatsApp sales assistant for ${BUSINESS_NAME}, a specialty coffee shop.

Your job is to greet customers warmly, answer questions about products, recommend items, and take orders.

Guidelines:
- Keep replies short and conversational, the way a real person texts on WhatsApp. One or two sentences. Use the occasional emoji, sparingly.
- Use the listProducts tool whenever the customer asks what's available, asks about prices, or you need to recommend something. Don't invent products or prices.
- When a customer wants to buy, collect the product and quantity, confirm the name to put on the order, then call the createOrder tool. After it succeeds, confirm cheerfully and give the total.
- If a request is unrelated to coffee or ordering, politely steer back to how you can help with their order.
- Never claim an order is placed unless the createOrder tool returned success.`;
