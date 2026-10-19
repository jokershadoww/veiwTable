// جلسة الأدمن: كوكي موقّع (HMAC) — الاسم والكلمة من متغيرات البيئة
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

export const ADMIN_COOKIE = "jadawil_admin_session";

const SECRET =
  process.env.ADMIN_SESSION_SECRET || "jadawil-mansatat-dev-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 أيام

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123456omarA";

function hmac(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

function sign(exp: number) {
  return `${exp}.${hmac(String(exp))}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || !sig) return false;
  if (Date.now() > exp) return false;
  const expected = hmac(String(exp));
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function checkCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function isAdminSession(): Promise<boolean> {
  // يضمن تقييم التحقق وقت الطلب (الجلسة ديناميكية بطبيعتها)
  await connection();
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}

export async function createAdminSession() {
  const store = await cookies();
  const exp = Date.now() + MAX_AGE * 1000;
  store.set(ADMIN_COOKIE, sign(exp), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroyAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
