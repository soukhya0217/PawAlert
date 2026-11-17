import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "power-alert-super-secret-key-change-in-production-2026";
const JWT_EXPIRES_IN = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  ngoId?: string;
  volunteerProfileId?: string;
}

export function signJwt(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
