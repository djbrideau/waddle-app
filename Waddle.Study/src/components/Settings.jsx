import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { whitelistTeacher, verifyQuestionSet, getWhitelist } from '../firebase/firestore';

export default function Settings() {
    const { logout, uid, role, displayName, checkAdmin } = useAuth();
    const { goBack } = useGame();
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [adminPanel, setAdminPanel] = useState(false);
    const [whitelistUid, setWhitelistUid] = useState('');
    const [verifySetId, setVerifySetId] = useState('');
    const [whitelist, setWhitelist] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        checkAdmin().then(setIsAdminUser);
    }, [checkAdmin]);

    async function loadWhitelist() {
        const wl = await getWhitelist();
        setWhitelist(wl);
    }

    async function handleWhitelistTeacher() {
        if (!whitelistUid.trim()) return;
        try {
            await whitelistTeacher(whitelistUid.trim());
            setMessage('Teacher whitelisted!');
            setWhitelistUid('');
            await loadWhitelist();
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    }

    async function handleVerifySet() {
        if (!verifySetId.trim()) return;
        try {
            await verifyQuestionSet(verifySetId.trim());
            setMessage('Question set verified!');
            setVerifySetId('');
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    }

    return (
        <div className="waddle-overlay settings-screen">
            <div className="screen-header">
                <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                <h2>Settings</h2>
            </div>

            <div className="settings-content">
                <div className="settings-section">
                    <h3>Profile</h3>
                    <p><strong>Name:</strong> {displayName}</p>
                    <p><strong>Role:</strong> {role}</p>
                    <p><strong>UID:</strong> <code className="uid-code">{uid}</code></p>
                </div>

                <div className="settings-section">
                    <button className="waddle-btn waddle-btn-danger" onClick={logout}>
                        Log Out
                    </button>
                </div>

                {/* Admin Panel — only visible to whitelisted admins */}
                {isAdminUser && (
                    <div className="settings-section admin-section">
                        <h3>Admin Panel</h3>
                        <button
                            className="waddle-btn"
                            onClick={() => { setAdminPanel(!adminPanel); if (!adminPanel) loadWhitelist(); }}
                        >
                            {adminPanel ? 'Hide Admin' : 'Show Admin Panel'}
                        </button>

                        {adminPanel && (
                            <div className="admin-panel">
                                <div className="admin-group">
                                    <h4>Whitelist Teacher (Dojo Access)</h4>
                                    <div className="admin-input-row">
                                        <input
                                            type="text"
                                            placeholder="Teacher UID"
                                            value={whitelistUid}
                                            onChange={e => setWhitelistUid(e.target.value)}
                                            className="waddle-input"
                                        />
                                        <button className="waddle-btn" onClick={handleWhitelistTeacher}>Add</button>
                                    </div>
                                </div>

                                <div className="admin-group">
                                    <h4>Verify Question Set</h4>
                                    <div className="admin-input-row">
                                        <input
                                            type="text"
                                            placeholder="Question Set ID"
                                            value={verifySetId}
                                            onChange={e => setVerifySetId(e.target.value)}
                                            className="waddle-input"
                                        />
                                        <button className="waddle-btn" onClick={handleVerifySet}>Verify</button>
                                    </div>
                                </div>

                                {whitelist && (
                                    <div className="admin-group">
                                        <h4>Current Whitelist</h4>
                                        <p><strong>Teacher Dojo Access:</strong></p>
                                        {(whitelist.teacherDojoAccess || []).length === 0
                                            ? <p className="empty-text">None</p>
                                            : (whitelist.teacherDojoAccess || []).map(wlUid => (
                                                <code key={wlUid} className="uid-code">{wlUid}</code>
                                            ))
                                        }
                                        <p><strong>Admin UIDs:</strong></p>
                                        {(whitelist.adminUids || []).length === 0
                                            ? <p className="empty-text">None</p>
                                            : (whitelist.adminUids || []).map(adminUid => (
                                                <code key={adminUid} className="uid-code">{adminUid}</code>
                                            ))
                                        }
                                    </div>
                                )}

                                {message && <p className="admin-message">{message}</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
