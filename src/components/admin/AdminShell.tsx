"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu, Table2, X } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter";

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070c1c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1300px] items-center gap-3 px-4 py-3 sm:px-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 text-[#1a1204]">
            <Table2 size={19} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white sm:text-base">
              لوحة أدمن — جدول منصات
            </p>
            <p className="hidden text-[11px] text-slate-400 sm:block">
              إضافة وتعديل المنصات والاختام والبطايق واللاعبين
            </p>
          </div>

          <div className="mr-auto flex items-center gap-2">
            <Link href="/" className="btn-soft hidden px-3 py-2 text-xs sm:inline-flex">
              <ExternalLink size={14} />
              عرض الموقع
            </Link>
            <button type="button" onClick={logout} className="btn-danger px-3 py-2 text-xs">
              <LogOut size={14} />
              <span className="hidden sm:inline">خروج</span>
            </button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="icon-btn sm:hidden"
              aria-label="القائمة"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-white/10 px-4 py-2 sm:hidden">
            <Link href="/" className="btn-soft w-full text-xs" onClick={() => setOpen(false)}>
              <ExternalLink size={14} />
              عرض الموقع
            </Link>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1300px] px-4 py-6 sm:px-6">{children}</main>

      <div className="mx-auto max-w-[1300px] px-4 pb-8 sm:px-6">
        <SiteFooter />
      </div>
    </div>
  );
}
