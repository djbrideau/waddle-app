import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { getDojoByCode, joinDojo, getDojo, getQuestionSet } from '../firebase/firestore';

export default function DojoStudent() {
    const { uid } = useAuth();
    const { goBack, navigate, enrolledDojos } = useGame();
    const [view, setView] = useState(enrolledDojos.length > 0 ? 'board' : 'join'); // join | board
    const [dojos, setDojos] = useState([]);
    const [selectedDojo, setSelectedDojo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDojos();
    }, [enrolledDojos]);

    async function loadDojos() {
        setLoading(true);
        const loaded = [];
        for (const dojoId of enrolledDojos) {
            const dojo = await getDojo(dojoId);
            if (dojo) loaded.push(dojo);
        }
        setDojos(loaded);
        if (loaded.length > 0 && !selectedDojo) {
            setSelectedDojo(loaded[0]);
        }
        setLoading(false);
    }

    return (
        <div className="waddle-overlay dojo-student-screen">
            <div className="screen-header">
                <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                <h2>Duck Dojo</h2>
                <button className="waddle-btn btn-sm" onClick={() => setView('join')}>+ Join Class</button>
            </div>

            {view === 'join' && (
                <DojoJoinCode
                    uid={uid}
                    onJoined={() => {
                        setView('board');
                        loadDojos();
                    }}
                    onCancel={() => {
                        if (dojos.length > 0) setView('board');
                        else goBack();
                    }}
                />
            )}

            {view === 'board' && (
                <div className="dojo-board">
                    {/* Dojo selector if in multiple */}
                    {dojos.length > 1 && (
                        <div className="dojo-tabs">
                            {dojos.map(d => (
                                <button
                                    key={d.dojoId}
                                    className={`tab-btn ${selectedDojo?.dojoId === d.dojoId ? 'active' : ''}`}
                                    onClick={() => setSelectedDojo(d)}
                                >
                                    {d.dojoName || 'Dojo'}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedDojo && (
                        <DojoBoard
                            dojo={selectedDojo}
                            onPlaySet={(setId, assignment) => {
                                navigate('QUIZ', {
                                    setId,
                                    dojoId: selectedDojo.dojoId,
                                    isMandatory: assignment.isMandatory,
                                    isBonusBounty: !assignment.isMandatory,
                                });
                            }}
                        />
                    )}

                    {loading && <p className="loading-text">Loading dojos...</p>}
                    {!loading && dojos.length === 0 && (
                        <div className="empty-dojo">
                            <p className="empty-text">You haven&apos;t joined any classes yet.</p>
                            <button className="waddle-btn waddle-btn-primary" onClick={() => setView('join')}>
                                Join a Class
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function DojoJoinCode({ uid, onJoined, onCancel }) {
    const CODE_LENGTH = 5;
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [joining, setJoining] = useState(false);
    const inputRefs = useRef([]);

    function handleInput(index, value) {
        const char = value.toUpperCase().slice(-1);
        const newCode = [...code];
        newCode[index] = char;
        setCode(newCode);
        setError('');

        // Auto-tab to next
        if (char && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (char && index === CODE_LENGTH - 1 && newCode.every(c => c)) {
            submitCode(newCode.join(''));
        }
    }

    function handleKeyDown(index, e) {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    async function submitCode(joinCode) {
        setJoining(true);
        setError('');
        try {
            const dojo = await getDojoByCode(joinCode);
            if (!dojo) {
                setError('Class not found. Check the code and try again.');
                setJoining(false);
                return;
            }
            if (dojo.studentList?.includes(uid)) {
                setError('You\'re already in this class!');
                setJoining(false);
                return;
            }
            await joinDojo(uid, dojo.dojoId);
            onJoined();
        } catch (err) {
            setError('Something went wrong. Try again.');
            setJoining(false);
        }
    }

    return (
        <div className="dojo-join">
            <h3>Join a Class</h3>
            <p>Enter the 5-character code from your teacher</p>

            <div className="join-code-inputs">
                {code.map((char, i) => (
                    <input
                        key={i}
                        ref={el => inputRefs.current[i] = el}
                        type="text"
                        className="join-code-char"
                        value={char}
                        onChange={e => handleInput(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        maxLength={1}
                        autoFocus={i === 0}
                        disabled={joining}
                    />
                ))}
            </div>

            {error && <p className="error-text">{error}</p>}
            {joining && <p className="loading-text">Joining class...</p>}

            <button className="waddle-btn" onClick={onCancel}>Cancel</button>
        </div>
    );
}

function DojoBoard({ dojo, onPlaySet }) {
    const [assignments, setAssignments] = useState({ mandatory: [], bonus: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAssignments();
    }, [dojo]);

    async function loadAssignments() {
        setLoading(true);
        const mandatory = [];
        const bonus = [];

        for (const assignment of (dojo.activeAssignments || [])) {
            const set = await getQuestionSet(assignment.contentId);
            if (set) {
                const entry = { ...assignment, set };
                if (assignment.isMandatory) mandatory.push(entry);
                else bonus.push(entry);
            }
        }

        setAssignments({ mandatory, bonus });
        setLoading(false);
    }

    if (loading) return <p className="loading-text">Loading assignments...</p>;

    return (
        <div className="dojo-bulletin-board">
            <div className="board-header">
                <h3>{dojo.dojoName || 'Duck Dojo'}</h3>
                <p className="dojo-teacher">Teacher: {dojo.teacherName}</p>
            </div>

            {/* Active Quests (Mandatory) */}
            <div className="board-section">
                <h4 className="board-section-title">Active Quests</h4>
                {assignments.mandatory.length === 0 ? (
                    <p className="empty-text">No active quests right now.</p>
                ) : (
                    assignments.mandatory.map(a => (
                        <div key={a.contentId} className="assignment-card mandatory-card" onClick={() => onPlaySet(a.contentId, a)}>
                            <div className="assignment-info">
                                <h5>{a.set.title}</h5>
                                <p>{a.set.questions?.length || 0} questions</p>
                            </div>
                            {a.rewardEgg && (
                                <div className="assignment-reward">
                                    <span className="egg-icon">&#129370;</span>
                                </div>
                            )}
                            <div className="play-indicator">&#9654;</div>
                        </div>
                    ))
                )}
            </div>

            {/* Bonus Bounties (Recommended) */}
            <div className="board-section">
                <h4 className="board-section-title">
                    Bonus Bounties
                    <span className="bounty-multiplier">1.5x Duck Bucks!</span>
                </h4>
                {assignments.bonus.length === 0 ? (
                    <p className="empty-text">No bonus bounties available.</p>
                ) : (
                    assignments.bonus.map(a => (
                        <div key={a.contentId} className="assignment-card bonus-card" onClick={() => onPlaySet(a.contentId, a)}>
                            <div className="assignment-info">
                                <h5>{a.set.title}</h5>
                                <p>{a.set.questions?.length || 0} questions</p>
                            </div>
                            <div className="play-indicator">&#9654;</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
