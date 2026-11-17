import connectDB from "../db/connect";
import Incident from "../db/models/Incident";
import MissingAnimal from "../db/models/MissingAnimal";
import { calculateDistanceKm } from "../utils";

export interface TriageResult {
  detectedSpecies: string;
  recommendedPriority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  urgencyScore: number; // 1-100
  injuryKeywordsFound: string[];
  suggestedAction: string;
}

export function analyzeIncidentDescription(description: string, category: string): TriageResult {
  const descLower = description.toLowerCase();

  const criticalKeywords = ["hit by car", "bleeding heavily", "fracture", "unconscious", "head injury", "crushed", "poison", "maggot", "convulsion", "seizure", "strangled", "attacked"];
  const highKeywords = ["limping", "open wound", "broken leg", "trapped", "puppy", "kitten", "crying", "severe", "dehydrated", "hypothermia"];
  const mediumKeywords = ["skin disease", "mange", "hair loss", "weak", "malnourished", "hungry", "abandoned"];

  const foundCritical = criticalKeywords.filter((k) => descLower.includes(k));
  const foundHigh = highKeywords.filter((k) => descLower.includes(k));
  const foundMedium = mediumKeywords.filter((k) => descLower.includes(k));

  if (foundCritical.length > 0 || descLower.includes("emergency") || category.includes("Accident")) {
    return {
      detectedSpecies: category.replace("Injured ", "").replace(" Emergency", ""),
      recommendedPriority: "CRITICAL",
      urgencyScore: 95,
      injuryKeywordsFound: foundCritical,
      suggestedAction: "Immediate ambulance dispatch & trauma stabilization required within 20 mins.",
    };
  }

  if (foundHigh.length > 0 || category.includes("Injured")) {
    return {
      detectedSpecies: category.replace("Injured ", "").replace(" Emergency", ""),
      recommendedPriority: "HIGH",
      urgencyScore: 75,
      injuryKeywordsFound: foundHigh,
      suggestedAction: "Mobilize nearby rescue volunteer with first-aid kit within 45 mins.",
    };
  }

  if (foundMedium.length > 0) {
    return {
      detectedSpecies: category.replace("Injured ", ""),
      recommendedPriority: "MEDIUM",
      urgencyScore: 45,
      injuryKeywordsFound: foundMedium,
      suggestedAction: "Schedule rescue vehicle & nutrition support within 2-4 hours.",
    };
  }

  return {
    detectedSpecies: category,
    recommendedPriority: "LOW",
    urgencyScore: 25,
    injuryKeywordsFound: [],
    suggestedAction: "Add to daily volunteer patrol schedule.",
  };
}

export async function detectDuplicateIncidents(
  coordinates: [number, number],
  animalCategory: string,
  hoursWindow = 6,
  radiusKm = 0.5
) {
  await connectDB();
  const timeLimit = new Date(Date.now() - hoursWindow * 60 * 60 * 1000);

  // Find recent active incidents
  const recentIncidents = await Incident.find({
    animalCategory,
    status: { $nin: ["RESOLVED", "UNABLE_TO_COMPLETE"] },
    createdAt: { $gte: timeLimit },
  });

  const duplicates = [];

  for (const inc of recentIncidents) {
    const incLon = inc.location.coordinates[0];
    const incLat = inc.location.coordinates[1];
    const dist = calculateDistanceKm(coordinates[1], coordinates[0], incLat, incLon);

    if (dist <= radiusKm) {
      duplicates.push({
        incidentId: inc.incidentId,
        id: inc._id.toString(),
        distanceMeters: Math.round(dist * 1000),
        status: inc.status,
        reportedAt: inc.createdAt,
        address: inc.location.address,
        similarity: Math.max(95 - Math.round(dist * 50), 70),
      });
    }
  }

  return duplicates;
}

export async function matchMissingPetWithRescues(missingAnimalId: string) {
  await connectDB();
  const missing = await MissingAnimal.findById(missingAnimalId);
  if (!missing) return [];

  const timeLimit = new Date(missing.lostDate.getTime() - 2 * 86400 * 1000); // 2 days before lost

  const candidates = await Incident.find({
    status: { $in: ["VOLUNTEER_ASSIGNED", "RESCUE_IN_PROGRESS", "ANIMAL_RESCUED", "TREATMENT_STARTED", "RECOVERY_MONITORING"] },
    createdAt: { $gte: timeLimit },
  });

  const matches = [];

  for (const inc of candidates) {
    const dist = calculateDistanceKm(
      missing.lastSeenLocation.coordinates[1],
      missing.lastSeenLocation.coordinates[0],
      inc.location.coordinates[1],
      inc.location.coordinates[0]
    );

    // If within 10 km
    if (dist <= 10) {
      const categoryMatch = inc.animalCategory.toLowerCase().includes(missing.species.toLowerCase());
      if (categoryMatch) {
        matches.push({
          incidentId: inc.incidentId,
          _id: inc._id.toString(),
          animalCategory: inc.animalCategory,
          distanceKm: dist,
          images: inc.images,
          status: inc.status,
          reportedAt: inc.createdAt,
          locationAddress: inc.location.address,
        });
      }
    }
  }

  return matches;
}
