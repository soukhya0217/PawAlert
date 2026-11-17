import { UserRole } from "../db/models/User";

export const VOLUNTEER_ROLES: UserRole[] = [
  "GENERAL_VOLUNTEER",
  "MEDICAL_VOLUNTEER",
  "FOOD_VOLUNTEER",
  "RESCUE_VOLUNTEER",
  "SHELTER_VOLUNTEER",
];

export const ADMIN_ROLES: UserRole[] = ["NGO_ADMIN", "SUPER_ADMIN"];

export function isVolunteer(role?: string): boolean {
  if (!role) return false;
  return VOLUNTEER_ROLES.includes(role as UserRole) || ADMIN_ROLES.includes(role as UserRole);
}

export function isVet(role?: string): boolean {
  if (!role) return false;
  return role === "VETERINARIAN" || role === "SUPER_ADMIN";
}

export function isNGOAdmin(role?: string): boolean {
  if (!role) return false;
  return role === "NGO_ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(role?: string): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageIncidents(role?: string): boolean {
  if (!role) return false;
  return isVolunteer(role) || isVet(role) || isNGOAdmin(role);
}

export function getRoleDisplayName(role?: string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Administrator";
    case "NGO_ADMIN":
      return "NGO Coordinator / Admin";
    case "VETERINARIAN":
      return "Veterinary Doctor";
    case "RESCUE_VOLUNTEER":
      return "Animal Rescue Specialist";
    case "MEDICAL_VOLUNTEER":
      return "Medical First-Responder";
    case "FOOD_VOLUNTEER":
      return "Feeding Caretaker";
    case "SHELTER_VOLUNTEER":
      return "Shelter Assistant";
    case "GENERAL_VOLUNTEER":
      return "General Volunteer";
    default:
      return "Animal Guardian (Public)";
  }
}
