"use client";

import React from "react";
import { useParams } from "next/navigation";
import TrackView from "@/components/track-view";

export default function TrackingPage() {
  const params = useParams();
  const trackingId = (params?.trackingId as string) || "live";

  return <TrackView trackingId={trackingId} />;
}
