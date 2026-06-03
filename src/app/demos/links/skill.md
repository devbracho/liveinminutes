# Skill: Link-in-bio + QR Code

Copy this file to your project root as `CLAUDE.md` (or paste it into your AI chat) to give your agent everything it needs to build this demo.

## What to build

A link-in-bio editor with a live phone-frame preview and a scannable QR code. The user fills in their name, bio, and links and sees changes instantly in the preview. Everything lives in `useState` — no backend. The QR code points at the deployed URL.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- `useState` for all state
- `qrcode.react` for QR generation
- `next/image` for the avatar

## Install

```bash
pnpm add qrcode.react
```

## State shape

```ts
type Link    = { id: string; label: string; url: string };
type Profile = { name: string; bio: string; avatarUrl: string; links: Link[] };
```

## Link mutations

```ts
const addLink    = () => setProfile(p => ({ ...p,
  links: [...p.links, { id: crypto.randomUUID(), label: "", url: "" }] }));

const removeLink = (id: string) => setProfile(p => ({ ...p,
  links: p.links.filter(l => l.id !== id) }));

const updateLink = (id: string, field: "label" | "url", value: string) =>
  setProfile(p => ({ ...p,
    links: p.links.map(l => l.id === id ? { ...l, [field]: value } : l) }));
```

## QR code

```tsx
import { QRCodeSVG } from "qrcode.react";

<QRCodeSVG
  value={process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourapp.vercel.app"}
  size={160}
  className="rounded-lg"
/>
```

## Phone frame preview

```tsx
<div className="mx-auto w-64 rounded-[2.5rem] border-4 border-foreground/20 bg-background shadow-2xl overflow-hidden">
  <div className="h-[560px] overflow-y-auto p-6 text-center">
    {/* avatar */}
    <div className="size-20 rounded-full bg-muted mx-auto mb-3 overflow-hidden">
      {profile.avatarUrl
        ? <Image src={profile.avatarUrl} alt={profile.name} width={80} height={80} className="object-cover" />
        : <span className="flex items-center justify-center h-full text-2xl font-bold">
            {profile.name.charAt(0).toUpperCase() || "?"}
          </span>
      }
    </div>
    <p className="font-bold">{profile.name || "Your Name"}</p>
    <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
    <div className="mt-4 space-y-2">
      {profile.links.filter(l => l.label && l.url).map(l => (
        <a key={l.id} href={l.url} className="block rounded-lg border px-4 py-2 text-sm hover:bg-muted">
          {l.label}
        </a>
      ))}
    </div>
  </div>
</div>
```

## Layout

Two-column on desktop: editor on the left, phone preview + QR on the right.

```tsx
<div className="grid gap-8 lg:grid-cols-2">
  <ProfileEditor profile={profile} onChange={setProfile} addLink={addLink} removeLink={removeLink} updateLink={updateLink} />
  <div className="flex flex-col items-center gap-6">
    <PhonePreview profile={profile} />
    <QRCodeSVG value={siteUrl} size={160} />
    <p className="text-xs text-muted-foreground text-center">Scan to open your live page</p>
  </div>
</div>
```

## Agent instructions

1. Single `"use client"` component tree — no server actions
2. Initialize state with empty strings and an empty links array
3. Avatar falls back to the first letter of the name (or "?" if blank)
4. Only render links in the preview that have both `label` and `url` filled in
5. The QR code should use `process.env.NEXT_PUBLIC_SITE_URL` or a hardcoded fallback URL
6. Zero env vars required — deploys immediately
