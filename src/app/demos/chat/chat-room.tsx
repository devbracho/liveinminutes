"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Message } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/client";

export function ChatRoom({
  initialMessages,
  userId,
  username,
}: {
  initialMessages: Message[];
  userId: string;
  username: string;
}) {
  const [msgs, setMsgs] = useState<Message[]>(initialMessages);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMsgs((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const content = (new FormData(form).get("content") as string).trim();
    if (!content || sending) return;

    setSending(true);
    await supabase.from("messages").insert({ user_id: userId, username, content });
    form.reset();
    setSending(false);
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="h-96 overflow-y-auto rounded-lg border bg-muted/20 p-4 space-y-3">
        {msgs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {msgs.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.userId === userId ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                msg.userId === userId
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border"
              }`}
            >
              {msg.userId !== userId && (
                <p className="text-xs font-medium mb-1 opacity-70">{msg.username}</p>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          name="content"
          placeholder="Type a message…"
          required
          disabled={sending}
          className="flex-1"
        />
        <Button type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
