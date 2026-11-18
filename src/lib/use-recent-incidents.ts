"use client";

import { useEffect, useState, useCallback } from "react";

export interface IncidentData {
  _id: string;
  incidentId: string;
  animalCategory: string;
  conditionDescription: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: string;
  location: {
    address: string;
    city: string;
    coordinates: [number, number]; // [lon, lat]
  };
  images?: string[];
  assignedVolunteerId?: {
    fullName: string;
    mobile?: string;
  };
  reporterName?: string;
  reporterPhone?: string;
  createdAt: string;
}

export function useRecentIncidents() {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/incidents?limit=50");
      if (!res.ok) throw new Error("Failed to load incidents");
      const data = await res.json();
      // Ensure we only store valid array from real DB - never fallback to mock items
      setIncidents(Array.isArray(data.incidents) ? data.incidents : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load incidents");
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();

    // Listen to real-time Server-Sent Events stream if available
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/stream");
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "INCIDENT_UPDATE" || payload.type === "NEW_INCIDENT") {
            fetchIncidents();
          }
        } catch (e) {
          // ignore parsing error
        }
      };
      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
      };
    } catch (e) {
      // EventSource fallback to periodic polling
    }

    const interval = setInterval(fetchIncidents, 12000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [fetchIncidents]);

  return { incidents, loading, error, refetch: fetchIncidents };
}

export default useRecentIncidents;
