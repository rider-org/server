/**
 * Generates a cookie string that can be used as the second parameter
 * in a "Set-Cookie" header. Use this instead of writing the cookie string yourself.
 *
 * @example
 * ```ts
 * res.appendHeader(
 *   "Set-Cookie",
 *   cookieGen({
 *     name: "google_oauth_state",
 *     value: state,
 *     path: "/",
 *     httpOnly: true,
 *     secure: process.env.NODE_ENV === "production",
 *     maxAge: 60 * 10, // 10 minutes
 *     sameSite: "Lax",
 *   }),
 * );
 * ```
 */
export default function cookieGen({
  name,
  value,
  path = "/",
  httpOnly,
  secure,
  maxAge,
  sameSite = "Lax",
  expires,
}: {
  name: string;
  value?: string;
  path: string;
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
  sameSite: "Strict" | "Lax" | "None";
  expires?: string;
}) {
  let res = "";

  res += `${name}=${value ?? ""}`;
  res += `; path=${path}`;

  if (httpOnly) {
    res += `; HttpOnly`;
  }

  if (secure) {
    res += `; Secure`;
  }

  if (maxAge) {
    res += `; Max-Age=${maxAge}`;
  }

  if (expires) {
    res += `; Expires=${expires}`;
  }

  res += `; SameSite=${sameSite}`;
  res += `;`;

  return res;
}
