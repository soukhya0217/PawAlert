import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";

/**
 * Bootstrap the platform:
 * ONLY ensures the single Super Admin user exists from environment configuration.
 * Never seeds fake/mock incidents or dummy records—the database starts completely clean.
 */
export async function bootstrapAdminOnly() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@pawalert.org";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass2026!";

    // Ensure Super Admin user exists
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
      console.log(`[BOOTSTRAP] Single Admin account verified: ${existingAdmin.email}`);
    }

    return { status: "READY", email: existingAdmin.email };
  } catch (error: any) {
    console.error("[BOOTSTRAP ERROR]:", error.message);
    return { status: "ERROR", error: error.message };
  }
}

export default bootstrapAdminOnly;
