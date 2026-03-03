import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';

export default function SplashScreen() {
    const { navigate } = useGame();
    const { displayName } = useAuth();
    const firstName = (displayName || 'Duckling').split(' ')[0];

    return (
        <div className="waddle-overlay splash-screen">
            <div className="splash-content">
                <img
                    src="assets/Assets/Logos/BetaWaddleLogo.png"
                    alt="Waddle"
                    className="splash-logo"
                />
                <p className="splash-greeting">Welcome back, {firstName}!</p>
                <button
                    className="waddle-btn waddle-btn-primary splash-btn"
                    onClick={() => navigate('HUB')}
                >
                    Let's Learn!
                </button>
            </div>
        </div>
    );
}
