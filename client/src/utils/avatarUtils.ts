/**
 * Centralized utility for generating Dicebear avatar URLs.
 * All avatar fallback generation in the frontend should use this function
 * to ensure consistent styling across the platform.
 */

const DICEBEAR_BASE = 'https://api.dicebear.com/7.x/initials/svg?seed=';
const BACKGROUND_COLORS = 'FAF8F5,F4F1EC,E7E2DA,ECE8E1,E8EBE4';
const TEXT_COLOR = '2D2D2D';

/**
 * Generates a Dicebear initials avatar URL with the HackMatch color scheme.
 *
 * @param name - The user's display name (defaults to 'User' if not provided)
 * @returns A complete Dicebear avatar URL with correct background and text colors
 */
export function getAvatarUrl(name: string = 'User'): string {
  const encodedName = encodeURIComponent(name);
  return `${DICEBEAR_BASE}${encodedName}&backgroundColor=${BACKGROUND_COLORS}&textColor=${TEXT_COLOR}`;
}

/**
 * Returns the user's profile picture URL, or generates a fallback
 * Dicebear avatar if the profile picture is missing.
 *
 * @param profilePicture - The user's stored profile picture URL (may be null/undefined)
 * @param name - The user's display name for fallback avatar generation
 * @returns A valid avatar URL
 */
export function getAvatarUrlWithFallback(profilePicture?: string | null, name: string = 'User'): string {
  if (profilePicture) {
    return profilePicture;
  }
  return getAvatarUrl(name);
}
