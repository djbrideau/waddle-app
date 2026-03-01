import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import {
    createDojo, getTeacherDojos, getDojo, addAssignment, removeAssignment,
    removeStudentFromDojo, getUserSets, getVerifiedSets, getUser, getDojoResults,
    isTeacherWhitelisted,
} from '../firebase/firestore';

export default function DojoTeacher() {
    const { uid, displayName } = useAuth();
    const { goBack, navigate } = useGame();
    const [dojos, setDojos] = useState([]);
    const [selectedDojo, setSelectedDojo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isWhitelisted, setIsWhitelisted] = useState(false);
    const [view, setView] = useState('main'); // main | create | manage | assign | analytics

    useEffect(() => {
        checkAccess();
    }, [uid]);

    async function checkAccess() {
        const wl = await isTeacherWhitelisted(uid);
        setIsWhitelisted(wl);
        if (wl) await loadDojos();
        setLoading(false);
    }

    async function loadDojos() {
        const d = await getTeacherDojos(uid);
        setDojos(d);
        if (d.length > 0 && !selectedDojo) setSelectedDojo(d[0]);
    }

    async function handleCreateDojo(name) {
        const result = await createDojo(uid, displayName, name);
        await loadDojos();
        setView('main');
        return result;
    }

    if (loading) {
        return (
            <div className="waddle-overlay teacher-screen">
                <p className="loading-text">Loading...</p>
            </div>
        );
    }

    if (!isWhitelisted) {
        return (
            <div className="waddle-overlay teacher-screen">
                <div className="screen-header">
                    <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                    <h2>Teacher Dashboard</h2>
                </div>
                <div className="whitelist-notice">
                    <h3>Access Pending</h3>
                    <p>Dojo creation requires approval. Contact the Waddle team to get whitelisted.</p>
                    <p className="uid-display">Your UID: <code className="uid-code">{uid}</code></p>
                    <p className="hint-text">Share this UID with the admin to get access.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="waddle-overlay teacher-screen">
            <div className="screen-header">
                <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                <h2>Teacher Dashboard</h2>
            </div>

            {view === 'main' && (
                <div className="teacher-main">
                    <div className="teacher-actions">
                        <button className="waddle-btn waddle-btn-primary" onClick={() => setView('create')}>
                            + New Dojo
                        </button>
                        <button className="waddle-btn" onClick={() => navigate('WORKSHOP')}>
                            Question Forge
                        </button>
                    </div>

                    {dojos.length === 0 ? (
                        <p className="empty-text">No dojos yet. Create your first classroom!</p>
                    ) : (
                        <div className="dojo-list">
                            {dojos.map(d => (
                                <div key={d.dojoId} className="dojo-card teacher-dojo-card">
                                    <div className="dojo-card-info">
                                        <h4>{d.dojoName}</h4>
                                        <p className="join-code-display">Code: <strong>{d.joinCode}</strong></p>
                                        <p>{d.studentList?.length || 0} students | {d.activeAssignments?.length || 0} assignments</p>
                                    </div>
                                    <div className="dojo-card-actions">
                                        <button className="waddle-btn btn-sm" onClick={() => { setSelectedDojo(d); setView('manage'); }}>
                                            Manage
                                        </button>
                                        <button className="waddle-btn btn-sm" onClick={() => { setSelectedDojo(d); setView('assign'); }}>
                                            Assign
                                        </button>
                                        <button className="waddle-btn btn-sm" onClick={() => { setSelectedDojo(d); setView('analytics'); }}>
                                            Analytics
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {view === 'create' && (
                <DojoCreator onCreate={handleCreateDojo} onCancel={() => setView('main')} />
            )}

            {view === 'manage' && selectedDojo && (
                <DojoManager
                    dojo={selectedDojo}
                    onBack={() => { setView('main'); loadDojos(); }}
                />
            )}

            {view === 'assign' && selectedDojo && (
                <AssignmentManager
                    dojo={selectedDojo}
                    teacherId={uid}
                    onBack={() => { setView('main'); loadDojos(); }}
                />
            )}

            {view === 'analytics' && selectedDojo && (
                <AnalyticsDeck
                    dojo={selectedDojo}
                    onBack={() => setView('main')}
                />
            )}
        </div>
    );
}

function DojoCreator({ onCreate, onCancel }) {
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);
    const [result, setResult] = useState(null);

    async function handleCreate() {
        if (!name.trim() || creating) return;
        setCreating(true);
        const res = await onCreate(name.trim());
        setResult(res);
        setCreating(false);
    }

    if (result) {
        return (
            <div className="dojo-created">
                <h3>Dojo Created!</h3>
                <p>Share this code with your students:</p>
                <div className="created-code">{result.joinCode}</div>
                <button className="waddle-btn waddle-btn-primary" onClick={onCancel}>Done</button>
            </div>
        );
    }

    return (
        <div className="dojo-creator">
            <h3>Create New Dojo</h3>
            <input
                type="text"
                className="waddle-input"
                placeholder="Class name (e.g., 3rd Period Science)"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <div className="editor-actions">
                <button className="waddle-btn" onClick={onCancel}>Cancel</button>
                <button className="waddle-btn waddle-btn-primary" onClick={handleCreate} disabled={creating || !name.trim()}>
                    {creating ? 'Creating...' : 'Create Dojo'}
                </button>
            </div>
        </div>
    );
}

function DojoManager({ dojo, onBack }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, [dojo]);

    async function loadStudents() {
        setLoading(true);
        const loaded = [];
        for (const uid of (dojo.studentList || [])) {
            const user = await getUser(uid);
            if (user) loaded.push(user);
        }
        setStudents(loaded);
        setLoading(false);
    }

    async function handleRemoveStudent(studentUid) {
        if (!confirm('Remove this student from the class?')) return;
        await removeStudentFromDojo(dojo.dojoId, studentUid);
        await loadStudents();
    }

    return (
        <div className="dojo-manager">
            <div className="sub-header">
                <button className="waddle-btn btn-sm back-btn" onClick={onBack}>&larr; Back</button>
                <h3>{dojo.dojoName} — Students</h3>
            </div>
            <p className="join-code-display">Join Code: <strong>{dojo.joinCode}</strong></p>

            {loading ? (
                <p className="loading-text">Loading students...</p>
            ) : students.length === 0 ? (
                <p className="empty-text">No students have joined yet. Share the join code!</p>
            ) : (
                <div className="student-list">
                    {students.map(s => (
                        <div key={s.uid} className="student-row">
                            <span className="student-name">{s.profile?.displayName || 'Student'}</span>
                            <button
                                className="waddle-btn btn-sm waddle-btn-danger"
                                onClick={() => handleRemoveStudent(s.uid)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AssignmentManager({ dojo, teacherId, onBack }) {
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSetId, setSelectedSetId] = useState('');
    const [isMandatory, setIsMandatory] = useState(true);

    useEffect(() => {
        loadSets();
    }, [teacherId]);

    async function loadSets() {
        setLoading(true);
        const [mine, verified] = await Promise.all([
            getUserSets(teacherId),
            getVerifiedSets(),
        ]);
        // Merge and deduplicate
        const all = [...mine];
        for (const v of verified) {
            if (!all.find(s => s.setId === v.setId)) all.push(v);
        }
        setSets(all);
        setLoading(false);
    }

    async function handleAssign() {
        if (!selectedSetId) return;
        await addAssignment(dojo.dojoId, {
            contentId: selectedSetId,
            isMandatory,
            rewardEgg: isMandatory ? 'egg_1' : null,
        });
        setSelectedSetId('');
        onBack();
    }

    async function handleRemove(contentId) {
        await removeAssignment(dojo.dojoId, contentId);
        onBack();
    }

    return (
        <div className="assignment-manager">
            <div className="sub-header">
                <button className="waddle-btn btn-sm back-btn" onClick={onBack}>&larr; Back</button>
                <h3>{dojo.dojoName} — Assignments</h3>
            </div>

            {/* Current assignments */}
            <div className="current-assignments">
                <h4>Current Assignments</h4>
                {(dojo.activeAssignments || []).length === 0 ? (
                    <p className="empty-text">No assignments yet.</p>
                ) : (
                    (dojo.activeAssignments || []).map(a => (
                        <div key={a.contentId} className="assignment-row">
                            <span>{a.contentId}</span>
                            <span className={`badge ${a.isMandatory ? 'badge-mandatory' : 'badge-bonus'}`}>
                                {a.isMandatory ? 'Mandatory' : 'Bonus'}
                            </span>
                            <button className="waddle-btn btn-sm waddle-btn-danger" onClick={() => handleRemove(a.contentId)}>
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add assignment */}
            <div className="add-assignment">
                <h4>Add Assignment</h4>
                {loading ? (
                    <p className="loading-text">Loading sets...</p>
                ) : (
                    <>
                        <select
                            className="waddle-input"
                            value={selectedSetId}
                            onChange={e => setSelectedSetId(e.target.value)}
                        >
                            <option value="">Select a question set...</option>
                            {sets.map(s => (
                                <option key={s.setId} value={s.setId}>
                                    {s.title} ({s.questions?.length || 0}q)
                                </option>
                            ))}
                        </select>
                        <div className="assign-options">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={isMandatory}
                                    onChange={e => setIsMandatory(e.target.checked)}
                                />
                                Mandatory
                            </label>
                        </div>
                        <button
                            className="waddle-btn waddle-btn-primary"
                            onClick={handleAssign}
                            disabled={!selectedSetId}
                        >
                            Assign
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function AnalyticsDeck({ dojo, onBack }) {
    const [results, setResults] = useState([]);
    const [students, setStudents] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [dojo]);

    async function loadAnalytics() {
        setLoading(true);
        const res = await getDojoResults(dojo.dojoId);
        setResults(res);

        // Load student names
        const names = {};
        for (const uid of (dojo.studentList || [])) {
            const user = await getUser(uid);
            if (user) names[uid] = user.profile?.displayName || 'Student';
        }
        setStudents(names);
        setLoading(false);
    }

    function downloadCSV() {
        const headers = ['Student', 'Set ID', 'Correct', 'Total', 'Percentage', 'Completed'];
        const rows = results.map(r => [
            students[r.uid] || r.uid,
            r.setId || '',
            r.correct,
            r.total,
            r.percentage + '%',
            r.completedAt?.toDate?.()?.toLocaleDateString?.() || 'N/A',
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dojo.dojoName || 'dojo'}_report.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="analytics-deck">
            <div className="sub-header">
                <button className="waddle-btn btn-sm back-btn" onClick={onBack}>&larr; Back</button>
                <h3>{dojo.dojoName} — Analytics</h3>
            </div>

            {loading ? (
                <p className="loading-text">Loading analytics...</p>
            ) : (
                <>
                    <div className="analytics-summary">
                        <div className="stat-box">
                            <span className="stat-number">{dojo.studentList?.length || 0}</span>
                            <span className="stat-label">Students</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">{results.length}</span>
                            <span className="stat-label">Completions</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-number">
                                {results.length > 0
                                    ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
                                    : 0}%
                            </span>
                            <span className="stat-label">Avg Score</span>
                        </div>
                    </div>

                    <button className="waddle-btn waddle-btn-primary" onClick={downloadCSV}>
                        Download Report (.csv)
                    </button>

                    {results.length > 0 && (
                        <div className="results-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Score</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, i) => (
                                        <tr key={i}>
                                            <td>{students[r.uid] || r.uid.slice(0, 8)}</td>
                                            <td>{r.correct}/{r.total}</td>
                                            <td>{r.percentage}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
