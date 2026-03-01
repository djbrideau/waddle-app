import { DUCK_POOL, RARITY, RARITY_DROP_RATES, DAZZLING_CHANCE, getDucksByRarity } from './duckDatabase';
import { getEggById, REWARD_EGG_POOL } from './eggDatabase';

// Roll a single duck from an egg
export function rollDuck(eggId) {
    const egg = getEggById(eggId);
    const rates = egg?.dropRates || {
        common: RARITY_DROP_RATES[RARITY.COMMON],
        rare: RARITY_DROP_RATES[RARITY.RARE],
        epic: RARITY_DROP_RATES[RARITY.EPIC],
        legendary: RARITY_DROP_RATES[RARITY.LEGENDARY],
    };

    // Step 1: Roll for rarity
    const rarityRoll = Math.random();
    let rarity;
    let cumulative = 0;

    cumulative += rates.common;
    if (rarityRoll < cumulative) rarity = RARITY.COMMON;
    else {
        cumulative += rates.rare;
        if (rarityRoll < cumulative) rarity = RARITY.RARE;
        else {
            cumulative += rates.epic;
            if (rarityRoll < cumulative) rarity = RARITY.EPIC;
            else rarity = RARITY.LEGENDARY;
        }
    }

    // Pick random duck of that rarity
    const pool = getDucksByRarity(rarity);
    const duck = pool[Math.floor(Math.random() * pool.length)];

    // Step 2: Dazzling reroll — uses the constant for configurability
    const isDazzling = Math.random() < DAZZLING_CHANCE;

    return {
        instanceId: `${duck.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        duckId: duck.id,
        name: duck.name,
        rarity: duck.rarity,
        color: duck.color,
        isDazzling,
        obtainedAt: Date.now(),
    };
}

// Roll a reward egg from the quiz reward pool
export function rollRewardEgg() {
    const totalWeight = REWARD_EGG_POOL.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of REWARD_EGG_POOL) {
        roll -= entry.weight;
        if (roll <= 0) {
            return {
                instanceId: `${entry.eggId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                eggId: entry.eggId,
                obtainedAt: Date.now(),
            };
        }
    }

    // Fallback
    return {
        instanceId: `egg_1_${Date.now()}`,
        eggId: 'egg_1',
        obtainedAt: Date.now(),
    };
}

// Determine if quiz rewards an egg (10% chance) or duck bucks
export function rollQuizRewardType() {
    return Math.random() < 0.10 ? 'egg' : 'duckBucks';
}
