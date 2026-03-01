import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import DuckDisplay from './DuckDisplay';
import { RARITY_COLORS } from '../data/duckDatabase';
import { getEggById } from '../data/eggDatabase';

export default function CollectionPond() {
    const { goBack, ducks, eggs, displayDuckId, setDisplayDuck, navigate } = useGame();
    const [tab, setTab] = useState('ducks'); // ducks | eggs
    const [selectedDuck, setSelectedDuck] = useState(null);
    const [filter, setFilter] = useState('all'); // all | common | rare | epic | legendary | dazzling

    const filteredDucks = ducks.filter(d => {
        if (filter === 'all') return true;
        if (filter === 'dazzling') return d.isDazzling;
        return d.rarity === filter;
    });

    // Sort: dazzling first, then by rarity (legendary > epic > rare > common)
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const sortedDucks = [...filteredDucks].sort((a, b) => {
        if (a.isDazzling !== b.isDazzling) return a.isDazzling ? -1 : 1;
        return (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4);
    });

    return (
        <div className="waddle-overlay collection-screen">
            <div className="screen-header">
                <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                <h2>Collection Pond</h2>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${tab === 'ducks' ? 'active' : ''}`} onClick={() => setTab('ducks')}>
                    Ducks ({ducks.length})
                </button>
                <button className={`tab-btn ${tab === 'eggs' ? 'active' : ''}`} onClick={() => setTab('eggs')}>
                    Eggs ({eggs.length})
                </button>
            </div>

            {tab === 'ducks' && (
                <>
                    {/* Filter bar */}
                    <div className="filter-bar">
                        {['all', 'common', 'rare', 'epic', 'legendary', 'dazzling'].map(f => (
                            <button
                                key={f}
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                                style={f !== 'all' && f !== 'dazzling' ? { borderColor: RARITY_COLORS[f] } : {}}
                            >
                                {f === 'dazzling' ? '✨' : ''}{f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="collection-grid">
                        {sortedDucks.length === 0 ? (
                            <p className="empty-text">No ducks found. Open some eggs!</p>
                        ) : (
                            sortedDucks.map(d => (
                                <div
                                    key={d.instanceId}
                                    className={`collection-item ${d.instanceId === displayDuckId ? 'is-display' : ''}`}
                                    onClick={() => setSelectedDuck(d)}
                                >
                                    <DuckDisplay duckId={d.duckId} isDazzling={d.isDazzling} size={72} />
                                    <span className="collection-item-name">{d.name}</span>
                                    <span className="collection-item-rarity" style={{ color: RARITY_COLORS[d.rarity] }}>
                                        {d.rarity}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {tab === 'eggs' && (
                <div className="eggs-list">
                    {eggs.length === 0 ? (
                        <p className="empty-text">No eggs in your inventory. Complete quizzes or visit the shop!</p>
                    ) : (
                        eggs.map(e => {
                            const info = getEggById(e.eggId);
                            return (
                                <div key={e.instanceId} className="egg-item" onClick={() => navigate('EGG_OPENING', { egg: e })}>
                                    <div className="egg-shape" style={{ backgroundColor: info?.color || '#a5d6a7' }}>
                                        &#129370;
                                    </div>
                                    <div className="egg-item-info">
                                        <h4>{info?.name || e.eggId}</h4>
                                        <p>{info?.description || 'An egg!'}</p>
                                    </div>
                                    <div className="play-indicator">Open</div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Duck detail modal */}
            {selectedDuck && (
                <div className="modal-backdrop" onClick={() => setSelectedDuck(null)}>
                    <div className="modal-content duck-detail-modal" onClick={e => e.stopPropagation()}>
                        <DuckDisplay duckId={selectedDuck.duckId} isDazzling={selectedDuck.isDazzling} size={128} />
                        <h3>{selectedDuck.name}</h3>
                        <p style={{ color: RARITY_COLORS[selectedDuck.rarity] }}>
                            {selectedDuck.isDazzling && '✨ Dazzling '}{selectedDuck.rarity}
                        </p>
                        <div className="duck-detail-actions">
                            <button
                                className="waddle-btn waddle-btn-primary"
                                onClick={async () => {
                                    await setDisplayDuck(selectedDuck.instanceId);
                                    setSelectedDuck(null);
                                }}
                            >
                                Set as Display Duck
                            </button>
                            <button className="waddle-btn" onClick={() => setSelectedDuck(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
