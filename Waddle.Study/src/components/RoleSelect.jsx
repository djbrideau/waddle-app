import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function RoleSelect() {
    const { selectRole } = useAuth();
    const [selecting, setSelecting] = useState(false);

    async function handleSelect(role) {
        if (selecting) return;
        setSelecting(true);
        try {
            await selectRole(role);
        } catch (err) {
            console.error('Role selection failed:', err);
            setSelecting(false);
        }
    }

    return (
        <div className="waddle-overlay role-select-screen">
            <div className="role-select-content">
                <h2 className="role-title">Who are you?</h2>
                <p className="role-subtitle">Choose your role to get started</p>

                <div className="role-options">
                    <button
                        className="role-card role-card-student"
                        onClick={() => handleSelect('student')}
                        disabled={selecting}
                    >
                        <div className="role-icon">&#x1F4DA;</div>
                        <h3>Student</h3>
                        <p>Complete quizzes, collect ducks, and have fun learning!</p>
                    </button>

                    <button
                        className="role-card role-card-teacher"
                        onClick={() => handleSelect('teacher')}
                        disabled={selecting}
                    >
                        <div className="role-icon">&#x1F3EB;</div>
                        <h3>Teacher</h3>
                        <p>Create content, manage classes, and track student progress.</p>
                    </button>
                </div>

                {selecting && <p className="role-loading">Setting up your account...</p>}
            </div>
        </div>
    );
}
