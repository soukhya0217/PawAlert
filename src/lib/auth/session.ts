import { cookies } from "next/headers";
import { verifyJwt, TokenPayload } from "./jwt";
import connectDB from "../db/connect";
import User, { IUser } from "../db/models/User";

export const AUTH_COOKIE_NAME = "power_alert_token";

export async function getSessionPayload(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJwt(token);
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  const payload = await getSessionPayload();
  if (!payload || !payload.userId) return null;

  try {
    await connectDB();
    const user = await User.findById(payload.userId);
    return user;
  } catch (err) {
    return null;
  }
}
