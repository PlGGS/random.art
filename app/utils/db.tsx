import { encodeBase64Url } from "@std/encoding";
import { crypto } from "@std/crypto/crypto";
import type { LoaderFunctionArgs } from "react-router";

export type ShortLink = {
  shortCode: string;
  createdAt: number;
  userEmailAddress: string;
  clickCount: number;
  lastClickEvent?: string;
};

export type LinkAnalytics = {
  shortUrl: string;
  createdAt: number;
  ipAddress: string;
  userAgent: string;
  country?: string;
};

export type Session = {
  emailAddress: string;
  createdAt: number;
};

export type User = {
  emailAddress: string;
  firstName: string;
  lastName: string;
  avatar_url: string;
};

export async function encodeShortCode(longUrl: string) {
  try {
    new URL(longUrl);
  } catch (error) {
    console.log(error);
    throw new Error("Invalid URL provided");
  }
  
  // Generate a unique identifier for the URL
  const urlData = new TextEncoder().encode(longUrl + Date.now());
  const hash = await crypto.subtle.digest("SHA-256", urlData);
  
  // Take the first 8 of the hash for the short URL
  const shortCode = encodeBase64Url(hash.slice(0, 8));
  
  return shortCode;
}

// Read & Write Data with Deno KV

// DB Singleton
let kvPromise: Promise<Deno.Kv> | null = null;
function getKvDB(): Promise<Deno.Kv> {
  if (!kvPromise) kvPromise = Deno.openKv();
  return kvPromise;
}

export async function storeShortLink(
  shortCode: string,
  userEmailAddress: string
) {
  const kv = await getKvDB();

  const shortLinkKey = ["shortlinks", shortCode];
  const userIndexKey = ["users", userEmailAddress, "shortcodes", shortCode];

  const shortLinkData: ShortLink = {
    shortCode,
    createdAt: Date.now(),
    userEmailAddress,
    clickCount: 0,
  };

  const res = await kv.atomic()
    .set(shortLinkKey, shortLinkData)
    .set(userIndexKey, null) // index record
    .commit();

  return res;
}

export async function getShortCodesByUser(email: string): Promise<string[]> {
  const kv = await getKvDB();
  const codes: string[] = [];

  const prefix = ["users", email, "shortcodes"];

  for await (const record of kv.list({ prefix })) {
    const shortCode = record.key[3].toString();
    codes.push(shortCode);
  }

  return codes;
}

export async function getShortLink(shortCode: string) {
  const kv = await getKvDB();
  const link = await kv.get<ShortLink>(["shortlinks", shortCode]);
  return link.value;
}

export async function getAllLinks() {
  const kv = await getKvDB();
  const list = kv.list<ShortLink>({ prefix: ["shortlinks"] });
  const res = await Array.fromAsync(list);
  const linkValues = res.map((v) => v.value);
  return linkValues;
}

export async function storeSession(sessionId: string, emailAddress: string) {
  const kv = await getKvDB();

  const sessionData: Session = {
    emailAddress,
    createdAt: Date.now(),
  };

  const key = ["sessions", sessionId]

  const res = kv.atomic()
    .set(key, sessionData)
    .commit();

  return res;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const kv = await getKvDB();
  const res = await kv.get<Session>(["sessions", sessionId]);
  return res.value ?? null;
}

export async function deleteSession(sessionId: string) {
  const kv = await getKvDB();
  await kv.delete(["sessions", sessionId]);
}

export async function deleteCurrentSession(request: Request): Promise<string | null> {
  const currentSessionAndId = await getCurrentSession(request);

  if (!currentSessionAndId) return null;

  const { sessionId } = currentSessionAndId;
  await deleteSession(sessionId);

  return sessionId;
}

export async function getCurrentSession(
  request: Request,
): Promise<{ sessionId: string; session: Session } | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";

  console.log("getCurrentSession: cookieHeader =" + cookieHeader)

  // Parse session cookie
  const cookies: Record<string, string> = {};
  for (const part of cookieHeader.split(/;\s*/)) {
    if (!part) continue;
    const [name, ...rest] = part.split("=");
    if (!name || rest.length === 0) continue;
    cookies[name] = rest.join("=");
  }

  console.log("getCurrentSession: cookies =" + cookies)
  
  const sessionId = cookies["session"];
  if (!sessionId) {
    console.log("getCurrentSession: no 'session' cookie, cookies =", cookies);
    return null;
  }

  const kv = await getKvDB();
  const entry = await kv.get<Session>(["sessions", sessionId]);

  const session = entry.value;
  if (!session) {
    console.log("getCurrentSession: no session in KV for id", sessionId);
    return null;
  }

  return { sessionId, session };
}

export async function storeUserByEmailAddress(emailAddress: string, userData: User) {
  const key = ["users", emailAddress];
  const kv = await getKvDB();
  const res = await kv.set(key, userData);
  return res;
}

export async function getUserByEmailAddress(emailAddress: string) {
  const key = ["users", emailAddress];
  const kv = await getKvDB();
  const res = await kv.get<User>(key);
  return res.value;
}

export async function deleteUserByEmailAddress(emailAddress: string) {
  const kv = await getKvDB();
  await kv.delete(["users", emailAddress]);
}

export async function getCurrentUser(request: Request): Promise<User | null> {
  const sessionIdAndSession = await getCurrentSession(request);
  if (!sessionIdAndSession) return null;

  const session = sessionIdAndSession.session;

  if (!session.emailAddress) return null;

  return await getUserByEmailAddress(session.emailAddress);
}

export async function getUserLinksByEmailAddress(emailAddress: string) {
  const kv = await getKvDB();
  const list = kv.list<string>({ prefix: [emailAddress] });
  const res = await Array.fromAsync(list);
  const userShortLinkKeys = res.map((v) => ["shortlinks", v.value]);

  const userRes = await kv.getMany<ShortLink[]>(userShortLinkKeys);
  const userShortLinks = await Array.fromAsync(userRes);

  return userShortLinks.map((v) => v.value);
}

// Realtime Analytics

export async function watchShortLink(shortCode: string) {
  const shortLinkKey = ["shortlinks", shortCode];
  const kv = await getKvDB();
  const shortLinkStream = kv.watch<ShortLink[]>([shortLinkKey]).getReader();
  return shortLinkStream;
}

export async function getClickEvent(shortCode: string, clickId: number) {
  const kv = await getKvDB();
  const analytics = await kv.get<LinkAnalytics>([
    "analytics",
    shortCode,
    clickId,
  ]);
  return analytics.value;
}

export async function incrementClickCount(
  shortCode: string,
  data?: Partial<LinkAnalytics>,
) {
  const shortLinkKey = ["shortlinks", shortCode];
  const kv = await getKvDB();
  const shortLink = await kv.get(shortLinkKey);
  const shortLinkData = shortLink.value as ShortLink;

  const newClickCount = shortLinkData?.clickCount + 1;

  const analyicsKey = ["analytics", shortCode, newClickCount];
  const analyticsData = {
    shortCode,
    createdAt: Date.now(),
    ...data,
  };

  const res = await kv.atomic()
    .check(shortLink)
    .set(shortLinkKey, {
      ...shortLinkData,
      clickCount: newClickCount,
    })
    .set(analyicsKey, analyticsData)
    .commit();

  if (!res.ok) {
    console.error("Error recording click!");
  }

  return res;
}

export async function resetKv() {
  const kv = await getKvDB();
  const iter = kv.list({ prefix: [] });
  const promises = [];
  for await (const res of iter) promises.push(kv.delete(res.key));
  await Promise.all(promises);
}
