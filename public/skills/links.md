# CLAUDE.md — Link-in-bio + QR Code

You are building a link-in-bio page editor with live preview and QR code. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Pure `useState` — no server, no database, no auth
- `qrcode.react` for QR code generation (install: `pnpm add qrcode.react`)
- `next/image` for the avatar
- shadcn/ui components, Tailwind CSS v4

## Hard rules

- Entire feature is `"use client"` components — no Server Actions, no API routes.
- Never use `useEffect` in this feature.
- Never use array index as a link key — use `crypto.randomUUID()`.
- Only render links that have both `label` AND `url` filled in.
- Zero env vars required.

## File structure

```
src/app/demos/links/
  page.tsx       — thin Server Component wrapper
  link-in-bio.tsx — "use client": editor + phone preview + QR
```

## State shape

```ts
type Link    = { id: string; label: string; url: string };
type Profile = { name: string; bio: string; avatarUrl: string; links: Link[] };

const [profile, setProfile] = useState<Profile>({
  name: "", bio: "", avatarUrl: "", links: []
});
```

## Link mutations

```ts
const addLink = () => setProfile(p => ({
  ...p, links: [...p.links, { id: crypto.randomUUID(), label: "", url: "" }]
}));

const removeLink = (id: string) => setProfile(p => ({
  ...p, links: p.links.filter(l => l.id !== id)
}));

const updateLink = (id: string, field: "label" | "url", value: string) =>
  setProfile(p => ({
    ...p, links: p.links.map(l => l.id === id ? { ...l, [field]: value } : l)
  }));
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
  <div className="h-[560px] overflow-y-auto p-6 text-center space-y-3">
    {/* Avatar */}
    <div className="size-20 rounded-full bg-muted mx-auto overflow-hidden flex items-center justify-center text-2xl font-bold">
      {profile.avatarUrl
        ? <Image src={profile.avatarUrl} alt={profile.name} width={80} height={80} className="object-cover" />
        : (profile.name.charAt(0).toUpperCase() || "?")}
    </div>
    <p className="font-bold">{profile.name || "Your Name"}</p>
    <p className="text-sm text-muted-foreground">{profile.bio}</p>
    {profile.links.filter(l => l.label && l.url).map(l => (
      <a key={l.id} href={l.url} className="block rounded-lg border px-4 py-2 text-sm hover:bg-muted">
        {l.label}
      </a>
    ))}
  </div>
</div>
```

## Layout

```tsx
<div className="grid gap-8 lg:grid-cols-2">
  {/* Left: editor — name, bio, avatar URL, link list */}
  <div className="space-y-4">
    <input placeholder="Your name" value={profile.name}
      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
    <textarea placeholder="Short bio" value={profile.bio}
      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
    {/* links list with label/url inputs + remove button */}
    <button type="button" onClick={addLink}>Add link</button>
  </div>

  {/* Right: phone preview + QR */}
  <div className="flex flex-col items-center gap-6">
    <PhonePreview profile={profile} />
    <QRCodeSVG value={siteUrl} size={160} />
  </div>
</div>
```

## Build order

1. Run `pnpm add qrcode.react`
2. Create `link-in-bio.tsx`: state shape, link mutations, two-column layout
3. Build the phone frame preview component
4. Add `<QRCodeSVG />` below the preview
5. Create `page.tsx` as a thin Server Component wrapper
6. Run `pnpm typecheck` and `pnpm check`
