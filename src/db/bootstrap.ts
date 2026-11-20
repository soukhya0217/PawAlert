import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";

/**
 * Bootstrap the platform:
 * ONLY ensures verified Administrator accounts exist from configuration.
 * Never seeds fake/mock incidents or dummy records—the database starts completely clean.
 */
export async function bootstrapAdminOnly() {
  try {
    await connectDB();

    const envAdminEmail = process.env.ADMIN_EMAIL;
    const defaultAdminEmail = "admin@pawalert.org";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass2026!";

    const adminEmails = [defaultAdminEmail];
    if (envAdminEmail && !adminEmails.includes(envAdminEmail.toLowerCase())) {
      adminEmails.push(envAdminEmail.toLowerCase());
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    for (const email of adminEmails) {
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({
          fullName: email === defaultAdminEmail ? "PawAlert Lead Commander" : "PawAlert Platform Director",
          email,
          mobile: "+91 99999 00000",
          passwordHash,
          city: "Bangalore",
          address: "HQ Central Dispatch, MG Road",
          location: { type: "Point", coordinates: [77.5946, 12.9716] },
          role: "SUPER_ADMIN",
          isEmailVerified: true,
          profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        });
        console.log(`[BOOTSTRAP] Administrator account verified: ${email}`);
      } else if (existing.role !== "SUPER_ADMIN" && existing.role !== "ADMIN") {
        existing.role = "SUPER_ADMIN";
        await existing.save();
      }
    }

    return { status: "READY" };
  } catch (error: any) {
    console.error("[BOOTSTRAP ERROR]:", error.message);
    return { status: "ERROR", error: error.message };
  }
}

export default bootstrapAdminOnly;
