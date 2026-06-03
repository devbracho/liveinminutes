"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LinkRow = {
  id: string;
  label: string;
  url: string;
};

function normalizeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function qrSrc(value: string, size = 240) {
  const data = encodeURIComponent(value || "https://liveinminutes.com");
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
}

export function LinkInBio() {
  const [name, setName] = useState("Your Name");
  const [tagline, setTagline] = useState("Builder. Maker. Shipping in minutes.");
  const [shareUrl, setShareUrl] = useState("liveinminutes.com");
  const [links, setLinks] = useState<LinkRow[]>([
    { id: crypto.randomUUID(), label: "Website", url: "https://example.com" },
    { id: crypto.randomUUID(), label: "X / Twitter", url: "https://x.com" },
  ]);

  function updateLink(id: string, patch: Partial<LinkRow>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLink() {
    setLinks((prev) => [...prev, { id: crypto.randomUUID(), label: "", url: "" }]);
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  const normalizedShare = normalizeUrl(shareUrl);

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      {/* Editor */}
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shareUrl">Public URL (for the QR code)</Label>
            <Input
              id="shareUrl"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="your-page.com"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Links</Label>
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-2">
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <Input
                aria-label="Link label"
                placeholder="Label"
                value={link.label}
                onChange={(e) => updateLink(link.id, { label: e.target.value })}
                className="w-32"
              />
              <Input
                aria-label="Link URL"
                placeholder="https://…"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeLink(link.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLink} className="gap-1">
            <Plus className="size-4" />
            Add link
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-6">
        <div className="mx-auto w-full max-w-xs rounded-2xl border bg-gradient-to-b from-primary/5 to-background p-6 text-center shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {name.trim().charAt(0).toUpperCase() || "?"}
          </div>
          <h2 className="mt-3 font-semibold">{name || "Your Name"}</h2>
          <p className="text-xs text-muted-foreground">{tagline}</p>
          <div className="mt-4 space-y-2">
            {links
              .filter((l) => l.label || l.url)
              .map((link) => (
                <a
                  key={link.id}
                  href={normalizeUrl(link.url) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border bg-card px-4 py-2.5 text-sm font-medium transition hover:border-primary/40 hover:bg-accent"
                >
                  {link.label || link.url}
                </a>
              ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-6">
          <p className="text-sm font-medium">Scan to open</p>
          <Image
            src={qrSrc(normalizedShare)}
            alt="QR code for your page"
            width={200}
            height={200}
            unoptimized
            className="rounded-lg bg-white p-2"
          />
          <a
            href={qrSrc(normalizedShare)}
            download="qr-code.png"
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            Download PNG
          </a>
        </div>
      </div>
    </div>
  );
}
