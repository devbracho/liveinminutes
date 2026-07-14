/**
 * Sanitize a user-supplied post-auth redirect target.
 *
 * Only same-origin, non-protocol-relative paths are allowed. Everything else
 * — absolute URLs (`https://evil.com`), protocol-relative (`//evil.com`),
 * backslash tricks (`/\evil.com`), and userinfo tricks (`@evil.com`, which
 * concatenated onto an origin becomes `https://site.com@evil.com`) — falls
 * back to `/` to prevent open redirects.
 */
export function safeRedirectPath(path: string | null | undefined): string {
  if (!path) return "/";
  // Must be an absolute path on this site...
  if (!path.startsWith("/")) return "/";
  // ...but not protocol-relative (`//host`) or a backslash-escaped variant (`/\host`).
  if (path.startsWith("//") || path.startsWith("/\\")) return "/";
  return path;
}
