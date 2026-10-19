"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  Gamepad2,
  LogOut,
  Menu,
  ShieldHalf,
  BarChart3,
  Table2,
  Users,
  X,
  ChevronsLeft,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
}

export default function AppShell({
  children,
  platformCount,
  freeCount,
}: {
  children: ReactNode;
  platformCount: number;
  freeCount: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/", label: "جدول المنصات", icon: <Table2 size={18} />, badge: String(platformCount) },
    { href: "/players", label: "الاعبين", icon: <Users size={18} />, badge: String(freeCount) },
    { href: "/stats", label: "الإحصائيات", icon: <BarChart3 size={18} /> },
    { href: "/admin", label: "لوحة الأدمن", icon: <ShieldHalf size={18} /> },
  ];

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 text-[#1a1204] shadow-lg shadow-gold-500/25">
          <CalendarRange size={24} />
        </span>
        <div>
          <p className="text-lg font-black leading-tight text-white">جدول منصات</p>
          <p className="text-[11px] font-semibold text-slate-400">متابعة القلاع واللاعبين</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="icon-btn mr-auto lg:hidden"
          aria-label="إغلاق القائمة"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-all ${
                active
                  ? "bg-gold-400/15 text-white ring-1 ring-gold-400/30"
                  : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                  active
                    ? "bg-gold-400/20 text-gold-400"
                    : "bg-white/[0.06] text-gold-400 group-hover:bg-gold-400/15"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-lg bg-white/[0.07] px-2 py-0.5 text-[11px] font-extrabold text-slate-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 p-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gold-400">
            <Gamepad2 size={16} />
            <p className="text-xs font-extrabold">منصات متاحة الآن</p>
          </div>
          <p className="mt-2 text-3xl font-black text-white">{freeCount}</p>
          <p className="text-[11px] text-slate-400">من أصل {platformCount} منصة</p>
        </div>
        <a
          href="/admin/login"
          className="btn-soft w-full text-xs"
        >
          <LogOut size={15} />
          دخول الأدمن
        </a>
      </div>
    </div>
  );

  return (
    <div className="lg:pr-[280px]">
      {/* الشريط الجانبي — سطح المكتب */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-[280px] border-l border-white/10 bg-[#080d1d]/85 backdrop-blur-xl lg:block">
        {SidebarContent}
      </aside>

      {/* الشريط الجانبي — الهاتف (درج) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-[85%] max-w-xs animate-slide-right border-l border-white/10 bg-[#080d1d]">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* الشريط العلوي — الهاتف */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#070c1c]/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="فتح القائمة">
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-gold-400 to-amber-600 text-[#1a1204]">
            <CalendarRange size={16} />
          </span>
          <span className="text-sm font-black text-white">جدول منصات</span>
        </div>
        <a href="/admin" className="btn-soft mr-auto px-3 py-1.5 text-[11px]">
          <ChevronsLeft size={14} />
          الأدمن
        </a>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
