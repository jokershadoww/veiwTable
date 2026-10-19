"use client";

import type { ReactNode } from "react";

/** سنة حقوق النشر — ثابتة عند البناء (يمنع `new Date()` داخل مكوّن عميل أثناء التصيير المسبق) */
const YEAR = 2026;

/**
 * تذييل حقوق النشر — يُعرض أسفل كل صفحات الموقع.
 */
export default function SiteFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
      <p className="font-bold text-slate-400">
        جميع الحقوق محفوظة © {YEAR} — <span className="text-gold-400">omar326</span>
      </p>
      {children}
    </footer>
  );
}
