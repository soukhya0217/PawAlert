import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Incident from "@/lib/db/models/Incident";

export async function GET() {
  try {
    await connectDB();
    const recentIncidents = await Incident.find({
      status: { $ne: "REJECTED" },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("incidentId animalCategory priority status location conditionDescription createdAt mediaUrls");

    return NextResponse.json({
      success: true,
      incidents: recentIncidents,
      count: recentIncidents.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn("[Public Recent GET] DB offline or query error:", err.message);
    return NextResponse.json({
      success: true,
      incidents: [],
      count: 0,
      timestamp: new Date().toISOString(),
    });
  }
}
