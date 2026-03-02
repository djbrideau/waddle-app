import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import DuckDisplay from './DuckDisplay';
import { EventBus } from '../game/EventBus';

export default function HubScreen() {
    const { displayName, role, logout } = useAuth();
    const {
        navigate, duckBucks, ducks, displayDuckId, setDisplayDuck,
    } = useGame();
    const [showDuckSwap, setShowDuckSwap] = useState(false);
    const [nearZone, setNearZone] = useState(null);

    const displayDuck = ducks.find(d => d.instanceId === displayDuckId);

    // Listen for proximity events from Phaser HubScene
    useEffect(() => {
        function handleZoneEnter(zoneName) {
            setNearZone(zoneName);
        }
        function handleZoneLeave() {
            setNearZone(null);
        }
        function handleZoneActivate(zoneName) {
            const screenMap = {
                workshop: 'WORKSHOP',
                dojo: 'DOJO',
                atlas: 'ATLAS',
                quizzes: 'QUESTION_SETS',
                shop: 'SHOP',
                collection: 'COLLECTION',
                settings: 'SETTINGS',
            };
            const screen = screenMap[zoneName];
            if (screen) navigate(screen);
        }

        EventBus.on('zone-enter', handleZoneEnter);
        EventBus.on('zone-leave', handleZoneLeave);
        EventBus.on('zone-activate', handleZoneActivate);

        return () => {
            EventBus.off('zone-enter', handleZoneEnter);
            EventBus.off('zone-leave', handleZoneLeave);
            EventBus.off('zone-activate', handleZoneActivate);
        };
    }, [navigate]);

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
                    </span>
                </button>
            </div>

            {/* Proximity prompt */}
            {nearZone && (
                <div className="proximity-prompt">
                    <span className="proximity-label">
                        Press SPACE or click to enter {nearZone.charAt(0).toUpperCase() + nearZone.slice(1)}
                    </span>
                </div>
            )}

            {/* Bottom-Left - Display Duck swap */}
            <div className="hud-bottom-left">
                <button className="hud-btn" onClick={() => setShowDuckSwap(true)} title="Change Duck">
                    <span className="hud-icon">&#128038;</span>
                </button>
            </div>

            {/* Bottom-Right - Collection Pond */}
            <div className="hud-bottom-right">
                <button className="hud-btn" onClick={() => navigate('COLLECTION')} title="Collection Pond">
                    <span className="hud-icon">&#127912;</span>
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
