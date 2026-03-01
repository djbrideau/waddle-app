import { useGame } from '../contexts/GameContext';

export default function AtlasPlaceholder() {
    const { goBack } = useGame();

    return (
        <div className="waddle-overlay atlas-screen">
            <div className="screen-header">
                <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                <h2>The Atlas</h2>
            </div>
            <div className="placeholder-content">
                <div className="placeholder-icon">&#127758;</div>
                <h3>Coming Soon!</h3>
                <p>Geography map challenges are being charted...</p>
                <p className="placeholder-sub">Seterra-style map challenges will appear here.</p>
            </div>
        </div>
    );
}
