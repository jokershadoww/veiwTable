import RegisterClient from "./RegisterClient";

// المسار ديناميكي (linkId) ويُطلب مع كل زيارة
export const instant = false;

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = await params;
  return <RegisterClient linkId={linkId} />;
}
