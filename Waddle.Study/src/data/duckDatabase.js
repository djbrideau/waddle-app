// Placeholder duck database — 40 ducks across 4 rarity tiers
// Each duck has a color from the Waddle palette for its placeholder shape
// Real art will replace these later

export const RARITY = {
    STARTER: 'starter',
    COMMON: 'common',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
};

export const RARITY_COLORS = {
    [RARITY.STARTER]: '#ffeb3b',
    [RARITY.COMMON]: '#a5d6a7',
    [RARITY.RARE]: '#29b6f6',
    [RARITY.EPIC]: '#ab47bc',
    [RARITY.LEGENDARY]: '#fbc02d',
};

export const RARITY_DROP_RATES = {
    [RARITY.COMMON]: 0.60,
    [RARITY.RARE]: 0.25,
    [RARITY.EPIC]: 0.10,
    [RARITY.LEGENDARY]: 0.05,
};

export const DAZZLING_CHANCE = 0.01; // 1% chance for dazzling variant

// The Classic — starter duck given to all players
export const THE_CLASSIC = {
    id: 'duck_classic',
    name: 'The Classic',
    rarity: RARITY.STARTER,
    color: '#ffeb3b',
};

// Placeholder ducks — 20 Common, 10 Rare, 6 Epic, 4 Legendary
export const DUCK_POOL = [
    // ─── Starter ─────────────────────────────────────────────
    THE_CLASSIC,

    // ─── Common (20) ───────────────────────────────────────
    { id: 'duck_c01', name: 'Puddle Duck #1',  rarity: RARITY.COMMON, color: '#80cbc4' },
    { id: 'duck_c02', name: 'Puddle Duck #2',  rarity: RARITY.COMMON, color: '#a5d6a7' },
    { id: 'duck_c03', name: 'Puddle Duck #3',  rarity: RARITY.COMMON, color: '#ccff90' },
    { id: 'duck_c04', name: 'Puddle Duck #4',  rarity: RARITY.COMMON, color: '#d7ccc8' },
    { id: 'duck_c05', name: 'Puddle Duck #5',  rarity: RARITY.COMMON, color: '#ffab91' },
    { id: 'duck_c06', name: 'Puddle Duck #6',  rarity: RARITY.COMMON, color: '#f5f5dc' },
    { id: 'duck_c07', name: 'Puddle Duck #7',  rarity: RARITY.COMMON, color: '#b0bec5' },
    { id: 'duck_c08', name: 'Puddle Duck #8',  rarity: RARITY.COMMON, color: '#e0e0e0' },
    { id: 'duck_c09', name: 'Puddle Duck #9',  rarity: RARITY.COMMON, color: '#f48fb1' },
    { id: 'duck_c10', name: 'Puddle Duck #10', rarity: RARITY.COMMON, color: '#ce93d8' },
    { id: 'duck_c11', name: 'Puddle Duck #11', rarity: RARITY.COMMON, color: '#81d4fa' },
    { id: 'duck_c12', name: 'Puddle Duck #12', rarity: RARITY.COMMON, color: '#fff176' },
    { id: 'duck_c13', name: 'Puddle Duck #13', rarity: RARITY.COMMON, color: '#ffe0bd' },
    { id: 'duck_c14', name: 'Puddle Duck #14', rarity: RARITY.COMMON, color: '#a1887f' },
    { id: 'duck_c15', name: 'Puddle Duck #15', rarity: RARITY.COMMON, color: '#cfd8dc' },
    { id: 'duck_c16', name: 'Puddle Duck #16', rarity: RARITY.COMMON, color: '#e8f5e9' },
    { id: 'duck_c17', name: 'Puddle Duck #17', rarity: RARITY.COMMON, color: '#ff9e9e' },
    { id: 'duck_c18', name: 'Puddle Duck #18', rarity: RARITY.COMMON, color: '#fce4ec' },
    { id: 'duck_c19', name: 'Puddle Duck #19', rarity: RARITY.COMMON, color: '#e3f2fd' },
    { id: 'duck_c20', name: 'Puddle Duck #20', rarity: RARITY.COMMON, color: '#b2ff59' },

    // ─── Rare (10) ─────────────────────────────────────────
    { id: 'duck_r01', name: 'Reef Duck #1',  rarity: RARITY.RARE, color: '#00a8cc' },
    { id: 'duck_r02', name: 'Reef Duck #2',  rarity: RARITY.RARE, color: '#26a69a' },
    { id: 'duck_r03', name: 'Reef Duck #3',  rarity: RARITY.RARE, color: '#8bc34a' },
    { id: 'duck_r04', name: 'Reef Duck #4',  rarity: RARITY.RARE, color: '#29b6f6' },
    { id: 'duck_r05', name: 'Reef Duck #5',  rarity: RARITY.RARE, color: '#ffb300' },
    { id: 'duck_r06', name: 'Reef Duck #6',  rarity: RARITY.RARE, color: '#e91e63' },
    { id: 'duck_r07', name: 'Reef Duck #7',  rarity: RARITY.RARE, color: '#ff7043' },
    { id: 'duck_r08', name: 'Reef Duck #8',  rarity: RARITY.RARE, color: '#4caf50' },
    { id: 'duck_r09', name: 'Reef Duck #9',  rarity: RARITY.RARE, color: '#90caf9' },
    { id: 'duck_r10', name: 'Reef Duck #10', rarity: RARITY.RARE, color: '#f48fb1' },

    // ─── Epic (6) ──────────────────────────────────────────
    { id: 'duck_e01', name: 'Tropic Duck #1', rarity: RARITY.EPIC, color: '#ab47bc' },
    { id: 'duck_e02', name: 'Tropic Duck #2', rarity: RARITY.EPIC, color: '#7b1fa2' },
    { id: 'duck_e03', name: 'Tropic Duck #3', rarity: RARITY.EPIC, color: '#6200ea' },
    { id: 'duck_e04', name: 'Tropic Duck #4', rarity: RARITY.EPIC, color: '#e64a19' },
    { id: 'duck_e05', name: 'Tropic Duck #5', rarity: RARITY.EPIC, color: '#c2185b' },
    { id: 'duck_e06', name: 'Tropic Duck #6', rarity: RARITY.EPIC, color: '#283593' },

    // ─── Legendary (4) ────────────────────────────────────
    { id: 'duck_l01', name: 'Mythic Duck #1', rarity: RARITY.LEGENDARY, color: '#fbc02d' },
    { id: 'duck_l02', name: 'Mythic Duck #2', rarity: RARITY.LEGENDARY, color: '#00e5ff' },
    { id: 'duck_l03', name: 'Mythic Duck #3', rarity: RARITY.LEGENDARY, color: '#76ff03' },
    { id: 'duck_l04', name: 'Mythic Duck #4', rarity: RARITY.LEGENDARY, color: '#b388ff' },
];

export function getDuckById(id) {
    return DUCK_POOL.find(d => d.id === id) || null;
}

export function getDucksByRarity(rarity) {
    return DUCK_POOL.filter(d => d.rarity === rarity);
}
