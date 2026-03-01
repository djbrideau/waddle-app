import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
    const { login } = useAuth();

    return (
        <div className="waddle-overlay login-screen">
            <div className="login-content">
                <h1 className="login-title">WADDLE</h1>
                <p className="login-subtitle">Learn. Play. Collect.</p>

                <button className="waddle-btn waddle-btn-primary login-btn" onClick={login}>
                    Log in with Google
                </button>
            </div>
        </div>
    );
}
