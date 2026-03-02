// Economy calculations for quiz rewards
// Range: 50-125 duck bucks per attempt
// Base: 50-100 based on performance
// Dojo mandatory: +25% bonus
// Dojo bonus bounty: +50% bonus (the "1.5x Duck Bucks!" tag)

export function calculateDuckBucks(correctAnswers, totalQuestions, options = {}) {
    const { isDojo = false, isBonusBounty = false } = options;

    if (totalQuestions === 0) return 0;

    const ratio = correctAnswers / totalQuestions;

    // Base: 50 + (ratio * 50) = 50-100 duck bucks
    let base = Math.round(50 + ratio * 50);

    // Apply dojo multiplier
    if (isBonusBounty) {
        base = Math.round(base * 1.5);
    } else if (isDojo) {
        base = Math.round(base * 1.25);
    }

    return base;
}

// Shop pricing helpers
export const SHOP_CONFIG = {
    RESTOCK_HOUR: 0, // Midnight UTC
    SLOTS: 3,
};
