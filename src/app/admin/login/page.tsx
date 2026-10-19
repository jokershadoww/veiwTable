"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, ShieldHalf, User } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّر تسجيل الدخول");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-gold-400 to-amber-600 text-[#1a1204] shadow-xl shadow-gold-500/25">
            <ShieldHalf size={30} />
          </span>
          <h1 className="mt-4 text-2xl font-black text-white">لوحة أدمن جدول منصات</h1>
          <p className="mt-1 text-sm text-slate-400">أدخل بيانات الإدارة للدخول</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="username">
              اسم المستخدم
            </label>
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="username"
                className="input pr-10"
                dir="ltr"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="password"
                className="input px-10"
                dir="ltr"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-white"
                aria-label="إظهار كلمة المرور"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-500/12 px-3 py-2.5 text-xs font-bold text-rose-200">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>

          <Link
            href="/"
            className="block text-center text-xs font-bold text-slate-400 hover:text-gold-300"
          >
            العودة للموقع الرئيسي
          </Link>
        </form>

        <SiteFooter />
      </div>
    </div>
  );
}
