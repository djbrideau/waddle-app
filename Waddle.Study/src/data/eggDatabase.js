// Egg types — these are the containers (crates) that hold ducks
// Each egg type has different weighted odds for duck rarity

export const EGG_TYPES = {
    EGG_1: {
        id: 'egg_1',
        name: 'Egg 1',
        description: 'A basic egg. Contains one duck.',
        price: 75,
        color: '#a5d6a7',
        shopWeight: 50,  // Very common in shop rotation
        // Drop rate overrides (defaults to standard if not specified)
        dropRates: null,  // Uses standard: Common 60%, Rare 25%, Epic 10%, Legendary 5%
    },
    EGG_2: {
        id: 'egg_2',
        name: 'Egg 2',
        description: 'A shimmering egg. Better odds for rare ducks.',
        price: 150,
        color: '#29b6f6',
        shopWeight: 35,  // Moderately common
        dropRates: {
            common: 0.45,
            rare: 0.35,
            epic: 0.14,
            legendary: 0.06,
        },
    },
    EGG_3: {
        id: 'egg_3',
        name: 'Egg 3',
        description: 'A golden egg. The best odds for epic and legendary ducks.',
        price: 300,
        color: '#fbc02d',
        shopWeight: 15,  // Rare in shop
        dropRates: {
            common: 0.30,
            rare: 0.35,
            epic: 0.25,
            legendary: 0.10,
        },
    },
};

export const EGG_LIST = Object.values(EGG_TYPES);

export function getEggById(id) {
    return EGG_LIST.find(e => e.id === id) || null;
}

// Eggs that can drop as quiz rewards (10% chance)
export const REWARD_EGG_POOL = [
    { eggId: 'egg_1', weight: 70 },
    { eggId: 'egg_2', weight: 25 },
    { eggId: 'egg_3', weight: 5 },
];
