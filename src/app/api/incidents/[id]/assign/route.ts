import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { takeResponsibilityAtomic } from "@/lib/services/matchingService";
import { isVolunteer } from "@/lib/auth/roles";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to accept rescue cases." },
        { status: 401 }
      );
    }

    if (!isVolunteer(user.role)) {
      return NextResponse.json(
        { error: "You must be a registered and verified volunteer or NGO administrator to take responsibility." },
        { status: 403 }
      );
    }

    const { id } = params;
    const result = await takeResponsibilityAtomic(id, user._id.toString());

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json({
      message: "Responsibility accepted! Case is now assigned to you.",
      incident: result.incident,
    });
  } catch (err: any) {
    console.error("Assign error:", err);
    return NextResponse.json({ error: err.message || "Failed to assign case" }, { status: 500 });
  }
}
