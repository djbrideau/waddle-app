// 128-Color "Sunny Tropics" Palette — 32 ramps of 4 shades (darkest → lightest)
export const WADDLE_COLORS = [
    '#003b59', '#006494', '#00a8cc', '#00e5ff', // Deep Ocean
    '#004d40', '#00897b', '#26a69a', '#80cbc4', // Teal Jungle
    '#5d4037', '#8d6e63', '#d7ccc8', '#f5f5dc', // Earthy Brown
    '#b71c1c', '#d32f2f', '#f44336', '#ff8a80', // Crimson
    '#d84b00', '#f57c00', '#ffb300', '#ffeb3b', // Sunset Orange
    '#bf360c', '#e64a19', '#ff7043', '#ffab91', // Burnt Sienna
    '#9e9e9e', '#e0e0e0', '#f5f5f5', '#ffffff', // Grayscale
    '#000000', '#121212', '#212121', '#424242', // Dark Grays
    '#880e4f', '#c2185b', '#e91e63', '#f48fb1', // Hot Pink
    '#4a148c', '#7b1fa2', '#ab47bc', '#ce93d8', // Royal Purple
    '#01579b', '#0288d1', '#29b6f6', '#81d4fa', // Sky Blue
    '#33691e', '#558b2f', '#8bc34a', '#ccff90', // Lime Green
    '#1b5e20', '#2e7d32', '#4caf50', '#a5d6a7', // Forest Green
    '#3e2723', '#5d4037', '#795548', '#a1887f', // Chocolate
    '#263238', '#455a64', '#78909c', '#b0bec5', // Blue Gray
    '#0a0b10', '#121526', '#1d2242', '#2c3563', // Midnight
    '#b59d00', '#fbc02d', '#fff176', '#ffff8d', // Gold
    '#c4b69c', '#e4dcc3', '#fff8e1', '#fffde7', // Cream
    '#0a0c1f', '#1a237e', '#283593', '#3f51b5', // Indigo
    '#c1906a', '#e3b778', '#f0e2b3', '#fefbea', // Sandy
    '#37474f', '#546e7a', '#78909c', '#cfd8dc', // Steel
    '#003300', '#004d00', '#006600', '#009900', // Deep Green
    '#d2ac8e', '#ffcc99', '#ffe0bd', '#fff5eb', // Peach
    '#8d5524', '#c68642', '#e0ac69', '#f3d1b1', // Skin Tone
    '#3c2c1e', '#513b2c', '#6a4f3b', '#8b7260', // Dark Wood
    '#6c1414', '#ac2424', '#ff5252', '#ff9e9e', // Blood Red
    '#3e6e8e', '#6a9cc2', '#90caf9', '#e3f2fd', // Ice Blue
    '#c0545f', '#e88d9c', '#f48fb1', '#fce4ec', // Rose
    '#4d8b5c', '#8ed28e', '#a5d6a7', '#e8f5e9', // Mint
    '#bf360c', '#e64a19', '#ff7043', '#ffab91', // Tangerine
    '#1a3c0a', '#3a8024', '#76ff03', '#b2ff59', // Neon Green
    '#1a0033', '#390066', '#6200ea', '#b388ff', // Ultra Violet
];

// Named ramp access (index 0-31, each ramp has 4 shades: dark, mid, light, lightest)
export const RAMPS = {
    DEEP_OCEAN: 0,  TEAL_JUNGLE: 1,  EARTHY_BROWN: 2,  CRIMSON: 3,
    SUNSET: 4,      BURNT_SIENNA: 5, GRAYSCALE: 6,     DARK_GRAYS: 7,
    HOT_PINK: 8,    PURPLE: 9,       SKY_BLUE: 10,     LIME: 11,
    FOREST: 12,     CHOCOLATE: 13,   BLUE_GRAY: 14,    MIDNIGHT: 15,
    GOLD: 16,       CREAM: 17,       INDIGO: 18,       SANDY: 19,
    STEEL: 20,      DEEP_GREEN: 21,  PEACH: 22,        SKIN: 23,
    DARK_WOOD: 24,  BLOOD_RED: 25,   ICE_BLUE: 26,     ROSE: 27,
    MINT: 28,       TANGERINE: 29,   NEON_GREEN: 30,   ULTRA_VIOLET: 31,
};

export function getRamp(rampIndex) {
    const base = rampIndex * 4;
    return WADDLE_COLORS.slice(base, base + 4);
}

export function getColor(rampIndex, shade) {
    return WADDLE_COLORS[rampIndex * 4 + shade];
}

// UI theme colors derived from palette
export const THEME = {
    bgDark: '#003b59',
    bgMedium: '#006494',
    bgLight: '#00a8cc',
    accent: '#00e5ff',
    gold: '#fbc02d',
    goldLight: '#fff176',
    wood: '#8d6e63',
    woodDark: '#5d4037',
    woodLight: '#d7ccc8',
    sand: '#f5f5dc',
    textWhite: '#ffffff',
    textDark: '#121212',
    success: '#4caf50',
    error: '#f44336',
    rare: '#29b6f6',
    epic: '#ab47bc',
    legendary: '#fbc02d',
    common: '#a5d6a7',
};
