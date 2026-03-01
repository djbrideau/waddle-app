import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import DuckDisplay from './DuckDisplay';
import { getEggById } from '../data/eggDatabase';
import { RARITY_COLORS } from '../data/duckDatabase';

export default function EggOpening({ egg }) {
    const { goBack, openEgg, navigate } = useGame();
    const [phase, setPhase] = useState('ready'); // ready | cracking | reveal
    const [duck, setDuck] = useState(null);
    const [eggInfo] = useState(() => getEggById(egg?.eggId));

    async function handleOpen() {
        if (!egg) return;
        setPhase('cracking');

        // Simulate cracking animation delay (placeholder for real animation)
        await new Promise(r => setTimeout(r, 1500));

        const result = await openEgg(egg);
        setDuck(result);
        setPhase('reveal');
    }

    if (!egg) {
        return (
            <div className="waddle-overlay egg-screen">
                <p>No egg selected.</p>
                <button className="waddle-btn" onClick={goBack}>Back</button>
            </div>
        );
    }

    return (
        <div className="waddle-overlay egg-screen">
            {phase === 'ready' && (
                <div className="egg-ready">
                    <h2>Open Egg?</h2>
                    <div
                        className="egg-big-display"
                        style={{ backgroundColor: eggInfo?.color || '#a5d6a7' }}
                    >
                        <span className="egg-big-icon">&#129370;</span>
                    </div>
                    <h3>{eggInfo?.name || egg.eggId}</h3>
                    <p>{eggInfo?.description || 'Tap to hatch!'}</p>
                    <div className="egg-actions">
                        <button className="waddle-btn" onClick={goBack}>Not Yet</button>
                        <button className="waddle-btn waddle-btn-primary" onClick={handleOpen}>
                            Hatch!
                        </button>
                    </div>
                </div>
            )}

            {phase === 'cracking' && (
                <div className="egg-cracking">
                    <div
                        className="egg-big-display egg-shake"
                        style={{ backgroundColor: eggInfo?.color || '#a5d6a7' }}
                    >
                        <span className="egg-big-icon">&#129370;</span>
                    </div>
                    <p className="cracking-text">Hatching...</p>
                </div>
            )}

            {phase === 'reveal' && duck && (
                <div className="egg-reveal">
                    <div className={`reveal-flash ${duck.rarity}`} />
                    <DuckDisplay
                        duckId={duck.duckId}
                        isDazzling={duck.isDazzling}
                        size={128}
                        className="reveal-duck"
                    />
                    <h2 className="reveal-name">{duck.name}</h2>
                    <p className="reveal-rarity" style={{ color: RARITY_COLORS[duck.rarity] }}>
                        {duck.isDazzling && '✨ Dazzling '}{duck.rarity.toUpperCase()}
                    </p>
                    <div className="egg-actions">
                        <button className="waddle-btn" onClick={() => navigate('COLLECTION')}>
                            View Collection
                        </button>
                        <button className="waddle-btn waddle-btn-primary" onClick={goBack}>
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
