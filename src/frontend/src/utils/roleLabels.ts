import { UserRole } from '../backend';

/**
 * Centralized role label constants for consistent user-facing text across the UI.
 * Internal role identifiers (UserRole enum) remain unchanged.
 */
export const ROLE_LABELS = {
  DIRECTOR: 'Direktur',
  MANAGEMENT: 'Management',
  KEPSEK: 'KepSek',
  GUEST: 'Guest',
  DIRECTOR_MANAGEMENT: 'Direktur/Management',
} as const;

/**
 * Get the user-facing label for a given UserRole.
 * @param role - The UserRole enum value
 * @returns The localized display label
 */
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.admin:
      return ROLE_LABELS.DIRECTOR_MANAGEMENT;
    case UserRole.user:
      return ROLE_LABELS.KEPSEK;
    case UserRole.guest:
      return ROLE_LABELS.GUEST;
    default:
      return 'Unknown';
  }
}

/**
 * Get the specific role label for Director or Management based on admin status.
 * @param isDirector - Whether the user is a Director (full admin)
 * @param isManagement - Whether the user is Management (admin without full permissions)
 * @returns The specific role label
 */
export function getSpecificRoleLabel(isDirector: boolean, isManagement: boolean): string {
  if (isDirector) return ROLE_LABELS.DIRECTOR;
  if (isManagement) return ROLE_LABELS.MANAGEMENT;
  return ROLE_LABELS.KEPSEK;
}
