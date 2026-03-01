import { getDuckById, RARITY_COLORS } from '../data/duckDatabase';

// Renders a placeholder duck shape (128x128 canvas area, duck centered ~64x64)
export default function DuckDisplay({ duckId, isDazzling = false, size = 128, onClick, className = '' }) {
    const duck = getDuckById(duckId);
    const color = duck?.color || '#ffeb3b';
    const rarity = duck?.rarity || 'common';
    const rarityColor = RARITY_COLORS[rarity] || '#a5d6a7';

    const scale = size / 128;
    const bodyW = 48 * scale;
    const bodyH = 40 * scale;
    const headR = 18 * scale;

    return (
        <div
            className={`duck-display ${isDazzling ? 'duck-dazzling' : ''} ${className}`}
            style={{ width: size, height: size, position: 'relative', cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
            title={duck ? `${duck.name}${isDazzling ? ' (Dazzling!)' : ''}` : 'No Duck'}
        >
            {/* Rarity glow ring */}
            <div
                className="duck-rarity-ring"
                style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: size * 0.85,
                    height: size * 0.85,
                    borderRadius: '50%',
                    border: `3px solid ${rarityColor}`,
                    opacity: 0.5,
                }}
            />

            {/* Duck body (ellipse) */}
            <svg
                viewBox="0 0 128 128"
                width={size}
                height={size}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                {/* Dazzling glow filter */}
                {isDazzling && (
                    <defs>
                        <filter id={`dazzle-${duckId}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                )}
                <g filter={isDazzling ? `url(#dazzle-${duckId})` : undefined}>
                    {/* Body */}
                    <ellipse cx="64" cy="72" rx="24" ry="20" fill={color} />
                    {/* Head */}
                    <circle cx="64" cy="48" r="18" fill={color} />
                    {/* Beak */}
                    <ellipse cx="64" cy="52" rx="8" ry="4" fill="#ffb300" />
                    {/* Eye left */}
                    <circle cx="58" cy="44" r="3" fill="#121212" />
                    {/* Eye right */}
                    <circle cx="70" cy="44" r="3" fill="#121212" />
                    {/* Eye shine */}
                    <circle cx="59" cy="43" r="1" fill="#ffffff" />
                    <circle cx="71" cy="43" r="1" fill="#ffffff" />
                    {/* Wing */}
                    <ellipse cx="50" cy="70" rx="10" ry="14" fill={color} opacity="0.7"
                        transform="rotate(-15 50 70)" />
                    {/* Tail */}
                    <polygon points="88,68 96,60 92,72" fill={color} opacity="0.8" />
                </g>
                {/* Number label */}
                <text x="64" y="108" textAnchor="middle" fontSize="10"
                    fill={rarityColor} fontFamily="'Press Start 2P', monospace">
                    {duck?.name?.split('#')[1] || '?'}
                </text>
            </svg>
        </div>
    );
}
