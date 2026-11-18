import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";

/**
 * Bootstrap ONLY the initial single Admin account from environment variables.
 * Absolutely ZERO mock incidents, fake animals, or dummy rescuers are seeded.
 */
export async function bootstrapAdminOnly() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@pawalert.org";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass2026!";

    // Check if any admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ role: "SUPER_ADMIN" }, { email: adminEmail }],
    });

    if (existingAdmin) {
      return { status: "EXISTS", email: existingAdmin.email };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const newAdmin = await User.create({
      fullName: "PawAlert Lead Commander",
      email: adminEmail,
      mobile: "+91 99999 00000",
      passwordHash,
      city: "Bangalore",
      address: "HQ Central Dispatch",
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
      role: "SUPER_ADMIN",
      isEmailVerified: true,
      profileImage: "",
    });

    console.log(`[BOOTSTRAP] Initial Admin account initialized: ${newAdmin.email}`);
    return { status: "CREATED", email: newAdmin.email };
  } catch (error: any) {
    console.error("[BOOTSTRAP ERROR]:", error.message);
    return { status: "ERROR", error: error.message };
  }
}

export default bootstrapAdminOnly;
