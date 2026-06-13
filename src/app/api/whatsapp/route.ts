import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { CATALOG, SYSTEM_PROMPT } from "@/app/demos/whatsapp/catalog";
import { getUserPremiumStatus } from "@/lib/auth/premium";
import { db } from "@/lib/db";
import { waMessages, waOrders } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

export const maxDuration = 30;

const nvidia = createOpenAICompatible({
  name: "nvidia",
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY ?? "",
});

const MODEL_ID = process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3-ultra-550b-a55b";

function lastUserText(messages: UIMessage[]): string {
  const last = messages.at(-1);
  if (last?.role !== "user") return "";
  return last.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join("")
    .trim();
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!(await getUserPremiumStatus())) {
    return new Response("Premium required", { status: 403 });
  }
  if (!process.env.NVIDIA_API_KEY) {
    return new Response("NVIDIA_API_KEY is not configured", { status: 500 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const incoming = lastUserText(messages);
  if (incoming) {
    await db.insert(waMessages).values({ userId: user.id, role: "user", content: incoming });
  }

  const result = streamText({
    model: nvidia.chatModel(MODEL_ID),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    providerOptions: {
      // Nemotron defaults to a long reasoning pass; disable it for snappy chat replies.
      nvidia: { chat_template_kwargs: { enable_thinking: false } },
    },
    tools: {
      listProducts: tool({
        description:
          "List the coffee products this shop sells, with prices and descriptions. Use before recommending or quoting prices.",
        inputSchema: z.object({}),
        execute: async () => ({ products: CATALOG }),
      }),
      createOrder: tool({
        description:
          "Place an order once the customer has confirmed the product, quantity, and the name for the order.",
        inputSchema: z.object({
          productId: z.enum(CATALOG.map((p) => p.id) as [string, ...string[]]),
          quantity: z.number().int().min(1).max(50),
          customerName: z.string().min(1).max(80),
        }),
        execute: async ({ productId, quantity, customerName }) => {
          const product = CATALOG.find((p) => p.id === productId);
          if (!product) {
            return { ok: false as const, error: "Unknown product." };
          }
          const [order] = await db
            .insert(waOrders)
            .values({
              userId: user.id,
              product: product.name,
              quantity,
              customerName,
              status: "confirmed",
            })
            .returning();
          return {
            ok: true as const,
            orderId: order.id,
            product: product.name,
            quantity,
            total: product.price * quantity,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    onFinish: async ({ responseMessage }) => {
      const text = responseMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => ("text" in part ? part.text : ""))
        .join("")
        .trim();
      if (text) {
        await db.insert(waMessages).values({
          userId: user.id,
          role: "assistant",
          content: text,
        });
      }
    },
  });
}
