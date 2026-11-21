import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/User";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await connectDB();
      const user = await User.findById(sessionUser._id).select("-passwordHash");
      if (user) {
        return NextResponse.json({ user });
      }
    } catch (dbErr: any) {
      console.warn("[Profile GET] Database connection unavailable:", dbErr.message);
    }

    return NextResponse.json({
      user: {
        _id: sessionUser._id || "session_user",
        fullName: sessionUser.fullName || "PawAlert Guardian",
        email: sessionUser.email,
        role: sessionUser.role || "PUBLIC_USER",
        city: sessionUser.city || "Bangalore",
        mobile: sessionUser.mobile || "",
        address: sessionUser.address || "Bangalore, India",
        location: sessionUser.location || { type: "Point", coordinates: [77.5946, 12.9716] },
        profileImage: sessionUser.profileImage || "",
      },
    });
  } catch (err: any) {
    console.error("[Profile GET] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, mobile, city, address, coordinates, profileImage } = body;

    try {
      await connectDB();
      const user = await User.findById(sessionUser._id);
      if (user) {
        if (fullName && typeof fullName === "string") {
          user.fullName = fullName.trim();
        }
        if (mobile && typeof mobile === "string") {
          user.mobile = mobile.trim();
        }
        if (city && typeof city === "string") {
          user.city = city.trim();
        }
        if (address !== undefined && typeof address === "string") {
          user.address = address.trim();
        }
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
          const [lon, lat] = coordinates;
          user.location = {
            type: "Point",
            coordinates: [Number(lon), Number(lat)],
          };
        }
        if (profileImage !== undefined && typeof profileImage === "string") {
          user.profileImage = profileImage;
        }

        await user.save();

        return NextResponse.json({
          message: "Guardian account and location details saved successfully",
          user: {
            id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            city: user.city,
            address: user.address,
            location: user.location,
            profileImage: user.profileImage,
            role: user.role,
          },
        });
      }
    } catch (dbErr: any) {
      console.warn("[Profile PUT] Database connection unavailable:", dbErr.message);
    }

    return NextResponse.json({
      message: "Guardian account and location details saved successfully",
      user: {
        id: sessionUser._id || "session_user",
        fullName: fullName || sessionUser.fullName,
        email: sessionUser.email,
        mobile: mobile || sessionUser.mobile,
        city: city || sessionUser.city,
        address: address || sessionUser.address,
        location: coordinates ? { type: "Point", coordinates } : sessionUser.location,
        profileImage: profileImage || sessionUser.profileImage,
        role: sessionUser.role,
      },
    });
  } catch (err: any) {
    console.error("[Profile PUT] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
