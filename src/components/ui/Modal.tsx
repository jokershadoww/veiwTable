"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

const SIZES: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  size = "md",
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeUp_.2s_both]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${SIZES[size]} animate-pop max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl`}
        style={{
          background: "linear-gradient(165deg, #141c3a 0%, #0b1124 60%, #090e1e 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 40px 90px -30px rgba(0,0,0,0.95)",
        }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4">
          {icon && (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-400/15 text-gold-400 ring-1 ring-gold-400/30">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-extrabold text-white sm:text-lg">{title}</h3>
            {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="icon-btn shrink-0"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(92vh-76px)] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
