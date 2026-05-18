import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabase } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "campusos-dev-secret-key-2025";
const SALT_ROUNDS = 12;

export type JwtPayload = {
  id: string;
  email: string;
  role: string;
  name: string;
  department: string | null;
};

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyActiveToken(token: string): Promise<JwtPayload | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const { data: user } = await supabase.from("users").select("is_active").eq("id", payload.id).maybeSingle();
    if (!user || !user.is_active) return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
