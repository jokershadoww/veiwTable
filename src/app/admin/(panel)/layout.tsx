import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/session";
import AdminShell from "@/components/admin/AdminShell";

// قراءة كوكي الجلسة تجعل هذا المسار ديناميكياً (يُطلب مع كل زيارة)
export const instant = false;

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminSession();
  if (!authed) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
