"use client";

import { useChat } from "@ai-sdk/react";
import {
  CheckIcon as Check,
  ChecksIcon as CheckCheck,
  ArrowCounterClockwiseIcon as RotateCcw,
  PaperPlaneTiltIcon as Send,
} from "@phosphor-icons/react/ssr";
import { DefaultChatTransport, isToolUIPart, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WaMessage, WaOrder } from "@/lib/db/schema";
import { resetConversation } from "./actions";
import { BUSINESS_NAME } from "./catalog";

type CreateOrderOutput = {
  ok: boolean;
  orderId: string;
  product: string;
  quantity: number;
  total: number;
};

function toUIMessage(row: WaMessage): UIMessage {
  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    parts: [{ type: "text", text: row.content }],
  };
}

export function WhatsAppBot({
  initialMessages,
  initialOrders,
}: {
  initialMessages: WaMessage[];
  initialOrders: WaOrder[];
}) {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/whatsapp" }),
    messages: initialMessages.map(toUIMessage),
  });
  const [input, setInput] = useState("");
  const [isResetting, startReset] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Orders placed this session, surfaced from createOrder tool results.
  const sessionOrders = useMemo(() => {
    const found: { orderId: string; product: string; quantity: number; total: number }[] = [];
    for (const message of messages) {
      for (const part of message.parts) {
        if (part.type === "tool-createOrder" && part.state === "output-available") {
          const out = part.output as CreateOrderOutput;
          if (out?.ok) {
            found.push({
              orderId: out.orderId,
              product: out.product,
              quantity: out.quantity,
              total: out.total,
            });
          }
        }
      }
    }
    return found;
  }, [messages]);

  const initialIds = new Set(initialOrders.map((o) => o.id));
  const newOrders = sessionOrders.filter((o) => !initialIds.has(o.orderId));
  const orderCount = initialOrders.length + newOrders.length;

  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 overflow-hidden rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
          <div className="flex size-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
            {BUSINESS_NAME.slice(0, 1)}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">{BUSINESS_NAME}</p>
            <p className="text-xs text-white/70">{busy ? "typing…" : "online · AI assistant"}</p>
          </div>
        </div>

        <div className="h-[28rem] space-y-2 overflow-y-auto bg-[#ECE5DD] p-4 dark:bg-muted/30">
          {messages.length === 0 && (
            <p className="mx-auto mt-10 max-w-xs rounded-lg bg-background/80 p-3 text-center text-sm text-muted-foreground">
              Say hi 👋 — try "what coffee do you have?" or "I'd like 2 bags of the house blend".
            </p>
          )}
          {messages.map((message) => {
            const isUser = message.role === "user";
            const text = message.parts
              .filter((p) => p.type === "text")
              .map((p) => ("text" in p ? p.text : ""))
              .join("");
            const toolNote = message.parts.find((p) => isToolUIPart(p));
            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                    isUser ? "bg-[#DCF8C6] text-foreground dark:bg-emerald-900/60" : "bg-background"
                  }`}
                >
                  {text && <p className="whitespace-pre-wrap">{text}</p>}
                  {toolNote && !text && (
                    <p className="text-xs italic text-muted-foreground">
                      {toolNote.type === "tool-createOrder"
                        ? "🧾 Placing your order…"
                        : "📋 Checking the menu…"}
                    </p>
                  )}
                  {isUser && (
                    <span className="float-right ml-2 mt-1 text-[#34B7F1]">
                      <CheckCheck className="inline size-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t bg-background p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            disabled={busy}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Orders</h2>
          <Badge variant="secondary">{orderCount}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Created live by the bot's <code className="text-xs">createOrder</code> tool.
        </p>

        <div className="mt-4 space-y-2">
          {orderCount === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          {newOrders.map((o) => (
            <div
              key={o.orderId}
              className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950/30"
            >
              <div className="flex items-center justify-between text-sm font-medium">
                <span>
                  {o.quantity}× {o.product}
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="size-3" />${o.total}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">just now</p>
            </div>
          ))}
          {initialOrders.map((o) => (
            <div key={o.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>
                  {o.quantity}× {o.product}
                </span>
                <Badge variant="outline" className="text-xs">
                  {o.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">for {o.customerName}</p>
            </div>
          ))}
        </div>

        {(messages.length > 0 || orderCount > 0) && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full text-muted-foreground"
            disabled={isResetting}
            onClick={() =>
              startReset(async () => {
                await resetConversation();
                setMessages([]);
                router.refresh();
              })
            }
          >
            <RotateCcw className="mr-1 size-3" />
            {isResetting ? "Clearing…" : "Reset conversation"}
          </Button>
        )}
      </div>
    </div>
  );
}
