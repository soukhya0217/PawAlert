import { NextRequest } from "next/server";
import connectDB from "@/lib/db/connect";
import Incident from "@/lib/db/models/Incident";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED", timestamp: Date.now() })}\n\n`)
      );

      let lastChecked = new Date();

      const interval = setInterval(async () => {
        try {
          await connectDB();
          const recent = await Incident.find({ updatedAt: { $gt: lastChecked } })
            .select("incidentId status priority updatedAt")
            .limit(5);

          if (recent.length > 0) {
            lastChecked = new Date();
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "INCIDENT_UPDATE",
                  count: recent.length,
                  timestamp: Date.now(),
                })}\n\n`
              )
            );
          } else {
            // Heartbeat
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "PING", timestamp: Date.now() })}\n\n`)
            );
          }
        } catch (e) {
          // ignore stream interval error
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
