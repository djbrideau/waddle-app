import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { getVerifiedSets, getUserSets, getQuestionSet } from '../firebase/firestore';

export default function QuestionSets() {
    const { uid } = useAuth();
    const { goBack, navigate } = useGame();
    const [tab, setTab] = useState('verified'); // verified | mine
    const [verifiedSets, setVerifiedSets] = useState([]);
    const [mySets, setMySets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadSets();
    }, [uid]);

    async function loadSets() {
        setLoading(true);
        const [verified, mine] = await Promise.all([
            getVerifiedSets(),
            getUserSets(uid),
        ]);
        setVerifiedSets(verified);
        setMySets(mine);
        setLoading(false);
    }

    function handlePlaySet(set) {
        // Game Mode Router: check available modes
        const modes = set.availableModes || ['StandardQuiz'];
        if (modes.length === 1) {
            // Auto-launch
            navigate('QUIZ', { setId: set.setId, mode: modes[0] });
        } else {
            // Show mode select (future-proofing)
            navigate('QUIZ', { setId: set.setId, mode: modes[0] });
        }
    }

    const activeSets = tab === 'verified' ? verifiedSets : mySets;
    const filteredSets = search.trim()
        ? activeSets.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
        : activeSets;

    return (
        <div className="waddle-overlay question-sets-screen">
            <div className="screen-header">
                <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                <h2>Question Sets</h2>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab-btn ${tab === 'verified' ? 'active' : ''}`}
                    onClick={() => setTab('verified')}
                >
                    Verified
                </button>
                <button
                    className={`tab-btn ${tab === 'mine' ? 'active' : ''}`}
                    onClick={() => setTab('mine')}
                >
                    My Sets
                </button>
            </div>

            {/* Search */}
            <div className="search-bar">
                <input
                    type="text"
                    className="waddle-input search-input"
                    placeholder="Search sets..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Set list */}
            <div className="sets-grid">
                {loading ? (
                    <p className="loading-text">Loading sets...</p>
                ) : filteredSets.length === 0 ? (
                    <p className="empty-text">
                        {tab === 'verified'
                            ? 'No verified sets available yet.'
                            : 'You haven\'t created any sets. Visit the Workshop!'}
                    </p>
                ) : (
                    filteredSets.map(set => (
                        <div key={set.setId} className="set-play-card" onClick={() => handlePlaySet(set)}>
                            <div className="set-play-info">
                                <h4>{set.title}</h4>
                                <p>{set.questions?.length || 0} questions</p>
                                <div className="set-badges">
                                    {set.isVerified && <span className="badge badge-verified">Verified</span>}
                                </div>
                            </div>
                            <div className="set-play-btn">
                                &#9654; Play
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
