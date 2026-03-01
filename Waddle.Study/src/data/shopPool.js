import { EGG_LIST } from './eggDatabase';

// Daily shop — 3 slots, client-side deterministic based on date seed
// Pool: eggs with weighted appearance chance
// Rarer eggs have smaller chance of appearing in shop

function seededRandom(seed) {
    let s = seed;
    return function () {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

function dateSeed(date) {
    const d = new Date(date);
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function generateDailyShop(date = new Date()) {
    const seed = dateSeed(date);
    const totalWeight = EGG_LIST.reduce((sum, e) => sum + e.shopWeight, 0);
    const items = [];

    for (let slot = 0; slot < 3; slot++) {
        // Use a different seed offset per slot
        const slotRng = seededRandom(seed + slot * 7919);

        const roll = slotRng() * totalWeight;
        let cumulative = 0;
        let selected = EGG_LIST[0];

        for (const egg of EGG_LIST) {
            cumulative += egg.shopWeight;
            if (roll < cumulative) {
                selected = egg;
                break;
            }
        }

        items.push({
            slotIndex: slot,
            itemId: selected.id,
            itemType: 'egg',
            name: selected.name,
            description: selected.description,
            price: selected.price,
            color: selected.color,
            rarity: selected.shopWeight <= 15 ? 'rare' : selected.shopWeight <= 35 ? 'uncommon' : 'common',
        });
    }

    // Calculate next restock (midnight UTC next day)
    const tomorrow = new Date(date);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    return {
        items,
        generatedDate: dateSeed(date),
        nextRestockTime: tomorrow.getTime(),
    };
}

export function getTimeUntilRestock() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
}

export function formatCountdown(ms) {
    if (ms <= 0) return '00:00:00';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
