"use client";

import { Clock, Gauge, HeartPulse, Timer, Zap } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Platform } from "@/lib/types";

const ROWS = [
  {
    key: "freeHours",
    label: "عدد ساعات حره",
    icon: <Clock size={18} />,
    color: "#38bdf8",
    unit: "ساعة",
  },
  {
    key: "healHours",
    label: "عدد ساعات العلاج",
    icon: <HeartPulse size={18} />,
    color: "#34d399",
    unit: "ساعة",
  },
  {
    key: "speed50",
    label: "تساريع مسيره 50%",
    icon: <Gauge size={18} />,
    color: "#f7c948",
    unit: "تساريع",
  },
  {
    key: "speed25",
    label: "تساريع مسيره 25%",
    icon: <Zap size={18} />,
    color: "#f472b6",
    unit: "تساريع",
  },
] as const;

export default function ReadinessModal({
  open,
  onClose,
  platform,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform | null;
}) {
  const readiness = platform?.readiness;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`الجاهزية — ${platform?.name ?? ""}`}
      subtitle="المؤشرات المُدخلة من إضافة المنصة"
      icon={<Timer size={19} />}
      size="md"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {ROWS.map((row, i) => (
          <div
            key={row.key}
            className={`card animate-fade-up delay-${i + 1} p-4`}
            style={{ borderColor: `${row.color}33` }}
          >
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-xl ring-1 ring-white/20"
                style={{ background: `${row.color}22`, color: row.color }}
              >
                {row.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-slate-400">{row.label}</p>
                <p className="text-2xl font-black tabular-nums text-white">
                  {Number(readiness?.[row.key] ?? 0)}
                  <span className="mr-1 text-xs font-bold text-slate-500">{row.unit}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
