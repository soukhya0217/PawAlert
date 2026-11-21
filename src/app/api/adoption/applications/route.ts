import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import AdoptionApplication from "@/lib/db/models/AdoptionApplication";
import AdoptionListing from "@/lib/db/models/AdoptionListing";
import Notification from "@/lib/db/models/Notification";
import { getCurrentUser } from "@/lib/auth/session";
import { isNGOAdmin } from "@/lib/auth/roles";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");

    const query: any = {};
    if (listingId) query.listingId = listingId;

    // Regular users see only their applications; NGO/Admins see all for their NGO or overall
    if (!isNGOAdmin(user.role)) {
      query.applicantUserId = user._id;
    }

    const applications = await AdoptionApplication.find(query)
      .sort({ createdAt: -1 })
      .populate("listingId")
      .populate("applicantUserId", "fullName email mobile profileImage");

    return NextResponse.json({ applications });
  } catch (err: any) {
    console.warn("[Adoption Applications GET] DB offline or query error:", err.message);
    return NextResponse.json({ applications: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit an adoption application" }, { status: 401 });
    }

    const body = await req.json();
    const {
      listingId,
      applicantName,
      applicantEmail,
      applicantPhone,
      address,
      city,
      homeType,
      ownershipType,
      hasOtherPets,
      petExperienceDetails,
      hoursPetAloneDaily,
      familyMembersCount,
    } = body;

    if (!listingId || !applicantName || !applicantPhone || !address) {
      return NextResponse.json({ error: "Please fill in all mandatory application fields" }, { status: 400 });
    }

    await connectDB();

    const listing = await AdoptionListing.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const application = await AdoptionApplication.create({
      listingId,
      applicantUserId: user._id,
      applicantName,
      applicantEmail: applicantEmail || user.email,
      applicantPhone,
      address,
      city: city || user.city || "Bangalore",
      homeType: homeType || "APARTMENT",
      ownershipType: ownershipType || "OWNED",
      hasOtherPets: hasOtherPets || false,
      petExperienceDetails: petExperienceDetails || "Committed to loving care",
      hoursPetAloneDaily: hoursPetAloneDaily || 4,
      familyMembersCount: familyMembersCount || 3,
      status: "SUBMITTED",
      ngoId: listing.ngoId,
    });

    // Increment application count on listing
    await AdoptionListing.findByIdAndUpdate(listingId, {
      $inc: { applicationsCount: 1 },
    });

    // Send confirmation in-app notification to applicant
    await Notification.create({
      recipientUserId: user._id,
      title: "🐾 Adoption Application Received!",
      message: `Your adoption request for ${listing.name} has been submitted. The shelter team will review your details soon.`,
      type: "ADOPTION_UPDATE",
      link: "/user/dashboard",
    });

    return NextResponse.json(
      {
        message: `Your application to adopt ${listing.name} has been submitted! Our adoption counselor will reach out shortly.`,
        application,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Adoption apply error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit adoption application" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isNGOAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized. NGO/Admin only." }, { status: 403 });
    }

    const { applicationId, status, notes } = await req.json();

    if (!applicationId || !status) {
      return NextResponse.json({ error: "applicationId and status are required" }, { status: 400 });
    }

    await connectDB();
    const app = await AdoptionApplication.findById(applicationId).populate("listingId");
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    app.status = status;
    app.reviewerNotes = notes;
    app.reviewedBy = user._id;
    app.reviewedAt = new Date();
    await app.save();

    // If approved, mark listing as PENDING_ADOPTION or ADOPTED
    if (status === "APPROVED") {
      await AdoptionListing.findByIdAndUpdate(app.listingId, {
        status: "ADOPTED",
      });
    }

    // Notify applicant
    await Notification.create({
      recipientUserId: app.applicantUserId,
      title: `Adoption Status: ${status}`,
      message: `Your adoption application has been updated to ${status}. ${notes || ""}`,
      type: "ADOPTION_UPDATE",
      link: "/user/dashboard",
      priority: "HIGH",
    });

    return NextResponse.json({ message: `Application status updated to ${status}`, application: app });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update application" }, { status: 500 });
  }
}
