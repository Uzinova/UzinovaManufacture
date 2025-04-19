/**
 * Configuration for admin access
 * 
 * This file contains the list of email addresses that have admin access
 * Only users with these email addresses will be able to access the admin panel
 */

export const ADMIN_EMAILS = [
  'admin@example.com',
  'mraxe2002@gmail.com',
  // Add more admin emails as needed
];

/**
 * Check if a given email has admin privileges
 */
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
