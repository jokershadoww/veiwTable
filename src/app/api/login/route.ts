import { NextResponse } from "next/server";
import { checkCredentials, createAdminSession } from "@/lib/session";

export async function POST(request: Request) {
  let username = "";
  let password = "";
  try {
    const body = await request.json();
    username = String(body.username ?? "");
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!checkCredentials(username, password)) {
    return NextResponse.json(
      { ok: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" },
      { status: 401 }
    );
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
