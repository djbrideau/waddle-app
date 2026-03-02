import { useGame } from '../contexts/GameContext';
import { getEggById } from '../data/eggDatabase';

export default function QuizResults({ result }) {
    const { navigate } = useGame();

    if (!result) {
        return (
            <div className="waddle-overlay results-screen">
                <p>No results to display.</p>
                <button className="waddle-btn" onClick={() => navigate('HUB')}>Back to Hub</button>
            </div>
        );
    }

    const { correct, total, percentage, maxStreak, duckBucks, egg, rewardType, setTitle } = result;
    const isPerfect = correct === total;
    const eggInfo = egg ? getEggById(egg.eggId) : null;

    return (
        <div className="waddle-overlay results-screen">
            <div className="results-card">
                <h2 className="results-title">
                    {isPerfect ? 'Perfect Score!' : correct > total / 2 ? 'Great Job!' : 'Keep Practicing!'}
                </h2>

                {setTitle && <p className="results-set-name">{setTitle}</p>}

                <div className="results-stats">
                    <div className="stat-box">
                        <span className="stat-number">{correct}</span>
                        <span className="stat-label">Correct</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">{total}</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">{percentage}%</span>
                        <span className="stat-label">Score</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-number">{maxStreak || 0}x</span>
                        <span className="stat-label">Best Streak</span>
                    </div>
                </div>

                <div className="results-rewards">
                    <h3>Rewards</h3>
                    {rewardType === 'egg' && eggInfo ? (
                        <div className="reward-item reward-egg">
                            <div className="reward-egg-shape" style={{ backgroundColor: eggInfo.color }}>
                                &#129370;
                            </div>
                            <span>You found an egg! ({eggInfo.name})</span>
                        </div>
                    ) : (
                        <div className="reward-item reward-bucks">
                            <span className="reward-bucks-amount">+{duckBucks} Duck Bucks</span>
                        </div>
                    )}

                </div>

                <div className="results-actions">
                    <button className="waddle-btn waddle-btn-primary" onClick={() => navigate('HUB')}>
                        Back to Pool
                    </button>
                    <button className="waddle-btn" onClick={() => navigate('QUESTION_SETS')}>
                        More Quizzes
                    </button>
                </div>
            </div>
        </div>
    );
}
