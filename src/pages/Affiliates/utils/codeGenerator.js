/**
 * Generates a unique affiliate code based on a name or random string.
 * Format: AFF-{YEAR}-{RANDOM}
 * Example: AFF-2024-X9J2
 */
export const generateAffiliateCode = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AFF-${year}-${random}`;
};
