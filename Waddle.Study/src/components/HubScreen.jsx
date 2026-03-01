import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import DuckDisplay from './DuckDisplay';

export default function HubScreen() {
    const { displayName, role, logout } = useAuth();
    const {
        navigate, duckBucks, goldenEggs, ducks, displayDuckId, setDisplayDuck,
    } = useGame();
    const [showDuckSwap, setShowDuckSwap] = useState(false);

    const displayDuck = ducks.find(d => d.instanceId === displayDuckId);

    return (
        <div className="waddle-overlay hub-screen">
            {/* HUD - Top corners */}
            <div className="hud-top-left">
                <button className="hud-btn" onClick={() => navigate('SETTINGS')} title="Settings">
                    <span className="hud-icon">&#9881;</span>
                </button>
            </div>
            <div className="hud-top-right">
                <button className="hud-btn economy-btn" onClick={() => navigate('SHOP')}>
                    <span className="currency-display">
                        <span className="currency-bucks">{duckBucks} DB</span>
                        <span className="currency-eggs">{goldenEggs} GE</span>
                    </span>
                </button>
            </div>

            {/* Center - Display Duck */}
            <div className="hub-center">
                <div className="hub-duck-container" onClick={() => setShowDuckSwap(true)}>
                    {displayDuck ? (
                        <DuckDisplay
                            duckId={displayDuck.duckId}
                            isDazzling={displayDuck.isDazzling}
                            size={128}
                        />
                    ) : (
                        <div className="hub-no-duck">
                            <div className="placeholder-duck">?</div>
                            <p>Tap to select a duck!</p>
                        </div>
                    )}
                </div>
                <p className="hub-greeting">Welcome, {displayName}!</p>
            </div>

            {/* Compass Rose - Four floating inner tubes */}
            <div className="compass-rose">
                <button
                    className="compass-btn compass-top"
                    onClick={() => navigate('WORKSHOP')}
                >
                    <span className="compass-icon">&#9998;</span>
                    <span className="compass-label">Workshop</span>
                </button>
                <button
                    className="compass-btn compass-bottom"
                    onClick={() => navigate('DOJO')}
                >
                    <span className="compass-icon">&#127947;</span>
                    <span className="compass-label">Duck Dojo</span>
                </button>
                <button
                    className="compass-btn compass-left"
                    onClick={() => navigate('ATLAS')}
                >
                    <span className="compass-icon">&#127758;</span>
                    <span className="compass-label">Atlas</span>
                </button>
                <button
                    className="compass-btn compass-right"
                    onClick={() => navigate('QUESTION_SETS')}
                >
                    <span className="compass-icon">&#10067;</span>
                    <span className="compass-label">Quizzes</span>
                </button>
            </div>

            {/* Bottom-Right - Collection Pond */}
            <div className="hud-bottom-right">
                <button className="hud-btn" onClick={() => navigate('COLLECTION')} title="Collection Pond">
                    <span className="hud-icon">&#128038;</span>
                </button>
            </div>

            {/* Duck Swap Modal */}
            {showDuckSwap && (
                <div className="modal-backdrop" onClick={() => setShowDuckSwap(false)}>
                    <div className="modal-content duck-swap-modal" onClick={e => e.stopPropagation()}>
                        <h3>Choose Display Duck</h3>
                        <div className="duck-swap-grid">
                            {ducks.length === 0 && (
                                <p className="empty-text">No ducks yet! Complete quizzes to earn eggs.</p>
                            )}
                            {ducks.map(d => (
                                <div
                                    key={d.instanceId}
                                    className={`duck-swap-item ${d.instanceId === displayDuckId ? 'selected' : ''}`}
                                    onClick={async () => {
                                        await setDisplayDuck(d.instanceId);
                                        setShowDuckSwap(false);
                                    }}
                                >
                                    <DuckDisplay duckId={d.duckId} isDazzling={d.isDazzling} size={64} />
                                    <span className="duck-swap-name">{d.name}</span>
                                </div>
                            ))}
                        </div>
                        <button className="waddle-btn" onClick={() => setShowDuckSwap(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
