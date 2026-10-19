import PlatformDetail from "@/components/home/PlatformDetail";

// المسار ديناميكي (id) ويُطلب مع كل زيارة
export const instant = false;

export const metadata = {
  title: "تفاصيل المنصة",
};

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlatformDetail id={id} />;
}
