"use client";

import { Coins, ShieldHalf, Crosshair } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Platform } from "@/lib/types";

export default function GoldModal({
  open,
  onClose,
  platform,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform | null;
}) {
  const gold = platform?.gold;

  const items = [
    {
      label: "عدد مذهب الثكنه",
      value: Number(gold?.barracks ?? 0),
      icon: <ShieldHalf size={22} />,
      from: "from-violet-500/25",
      to: "to-fuchsia-500/10",
      color: "#c4b5fd",
    },
    {
      label: "عدد مذهب الرماه",
      value: Number(gold?.archers ?? 0),
      icon: <Crosshair size={22} />,
      from: "from-sky-500/25",
      to: "to-cyan-500/10",
      color: "#7dd3fc",
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`المذهب — ${platform?.name ?? ""}`}
      subtitle="العدد بالمليون"
      icon={<Coins size={19} />}
      size="md"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`card bg-gradient-to-br ${item.from} ${item.to} p-5 text-center`}
          >
            <span
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-1 ring-white/20"
              style={{ color: item.color, background: "rgba(0,0,0,0.25)" }}
            >
              {item.icon}
            </span>
            <p className="mt-3 text-3xl font-black tabular-nums text-white">
              {item.value.toLocaleString("ar-EG")}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-300">{item.label}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">مليون</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
