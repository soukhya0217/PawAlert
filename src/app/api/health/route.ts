import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  const isDbConnected = mongoose.connection.readyState === 1;

  return NextResponse.json({
    status: "ok",
    service: "PawAlert 24/7 Animal Rescue & Emergency Dispatch Platform",
    timestamp: new Date().toISOString(),
    database: isDbConnected ? "CONNECTED" : "DISCONNECTED",
    version: "2.0.0",
    architecture: "Next.js + MongoDB + Three.js + Leaflet",
  });
}
