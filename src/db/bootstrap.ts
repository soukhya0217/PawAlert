import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";
import Incident from "@/lib/db/models/Incident";

/**
 * Bootstrap the platform:
 * 1. Ensures the Super Admin user exists.
 * 2. Seeds initial realistic animal distress cases if none exist,
 *    ensuring the interactive map and live triage feeds are populated.
 */
export async function bootstrapAdminOnly() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@pawalert.org";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass2026!";

    // 1. Ensure Super Admin user exists
    let existingAdmin = await User.findOne({
      $or: [{ role: "SUPER_ADMIN" }, { email: adminEmail }],
    });

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      existingAdmin = await User.create({
        fullName: "PawAlert Lead Commander",
        email: adminEmail,
        mobile: "+91 99999 00000",
        passwordHash,
        city: "Bangalore",
        address: "HQ Central Dispatch, MG Road",
        location: { type: "Point", coordinates: [77.5946, 12.9716] },
        role: "SUPER_ADMIN",
        isEmailVerified: true,
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      });
      console.log(`[BOOTSTRAP] Initial Admin account created: ${existingAdmin.email}`);
    }

    // 2. Ensure initial active incidents exist so the map & diorama are never empty
    const incidentCount = await Incident.countDocuments();
    if (incidentCount === 0) {
      const sampleCases = [
        {
          incidentId: "PAW-BLR-2026-001",
          animalCategory: "Injured Dog",
          conditionDescription: "Golden retriever pup hit by two-wheeler, severe limp on rear left leg, resting under auto-rickshaw.",
          priority: "CRITICAL",
          status: "REPORTED",
          location: {
            type: "Point",
            coordinates: [77.6412, 12.9784], // Indiranagar 100ft Road
            address: "100ft Road, Near KFC Junction, Indiranagar",
            landmark: "Indiranagar Metro Station",
            city: "Bangalore",
          },
          images: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80"],
          reporterName: "Priya Sharma",
          reporterPhone: "+91 98450 11223",
          reporterEmail: "priya.s@example.com",
          slaDeadline: new Date(Date.now() + 30 * 60 * 1000), // 30 mins SLA
          isEscalated: false,
          statusHistory: [
            {
              status: "REPORTED",
              timestamp: new Date(),
              notes: "Dispatched to Indiranagar rapid rescue squad",
            },
          ],
        },
        {
          incidentId: "PAW-BLR-2026-002",
          animalCategory: "Injured Cat",
          conditionDescription: "Calico community kitten stuck inside stormwater drain grate, whimpering continuously.",
          priority: "HIGH",
          status: "VOLUNTEER_ASSIGNED",
          location: {
            type: "Point",
            coordinates: [77.6245, 12.9352], // Koramangala 4th Block
            address: "80ft Road, Koramangala 4th Block",
            landmark: "Near Sony World Signal",
            city: "Bangalore",
          },
          images: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80"],
          reporterName: "Arjun Reddy",
          reporterPhone: "+91 98860 33445",
          reporterEmail: "arjun.r@example.com",
          slaDeadline: new Date(Date.now() + 45 * 60 * 1000),
          isEscalated: false,
          statusHistory: [
            {
              status: "REPORTED",
              timestamp: new Date(Date.now() - 15 * 60 * 1000),
              notes: "Initial alert submitted via citizen portal",
            },
            {
              status: "VOLUNTEER_ASSIGNED",
              timestamp: new Date(),
              notes: "Assigned to Koramangala Feline Emergency Unit",
            },
          ],
        },
        {
          incidentId: "PAW-BLR-2026-003",
          animalCategory: "Injured Bird",
          conditionDescription: "Brahminy Kite entangled in synthetic nylon glass manja thread, resting on low bamboo branch.",
          priority: "HIGH",
          status: "REPORTED",
          location: {
            type: "Point",
            coordinates: [77.5946, 12.9716], // Cubbon Park
            address: "Cubbon Park Avenue, Near Central Library",
            landmark: "Cubbon Park Metro Exit",
            city: "Bangalore",
          },
          images: ["https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?auto=format&fit=crop&w=600&q=80"],
          reporterName: "Vikram Das",
          reporterPhone: "+91 99001 22334",
          reporterEmail: "vikram.d@example.com",
          slaDeadline: new Date(Date.now() + 60 * 60 * 1000),
          isEscalated: false,
          statusHistory: [
            {
              status: "REPORTED",
              timestamp: new Date(),
              notes: "Avian trauma specialist alerted",
            },
          ],
        },
        {
          incidentId: "PAW-BLR-2026-004",
          animalCategory: "Stray Cattle",
          conditionDescription: "Young stray calf with deep laceration on front shoulder, being guarded by local street vendor.",
          priority: "CRITICAL",
          status: "VOLUNTEER_EN_ROUTE",
          location: {
            type: "Point",
            coordinates: [77.6033, 12.9141], // BTM Layout 2nd Stage
            address: "7th Main Road, BTM 2nd Stage",
            landmark: "Near Udupi Garden Signal",
            city: "Bangalore",
          },
          images: ["https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"],
          reporterName: "Meera Nair",
          reporterPhone: "+91 97412 88990",
          reporterEmail: "meera.n@example.com",
          slaDeadline: new Date(Date.now() + 20 * 60 * 1000),
          isEscalated: false,
          statusHistory: [
            {
              status: "REPORTED",
              timestamp: new Date(Date.now() - 25 * 60 * 1000),
            },
            {
              status: "VOLUNTEER_EN_ROUTE",
              timestamp: new Date(),
              notes: "Bovine veterinary ambulance en route",
            },
          ],
        },
      ];

      await Incident.insertMany(sampleCases);
      console.log(`[BOOTSTRAP] Seeded 4 active Bangalore animal distress cases.`);
    }

    return { status: "READY", email: existingAdmin.email };
  } catch (error: any) {
    console.error("[BOOTSTRAP ERROR]:", error.message);
    return { status: "ERROR", error: error.message };
  }
}

export default bootstrapAdminOnly;
