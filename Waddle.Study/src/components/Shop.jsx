import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { generateDailyShop, getTimeUntilRestock, formatCountdown } from '../data/shopPool';
import { getEggById } from '../data/eggDatabase';

export default function Shop() {
    const { goBack, duckBucks, goldenEggs, purchaseEgg, navigate } = useGame();
    const [shop, setShop] = useState(null);
    const [countdown, setCountdown] = useState('');
    const [purchasing, setPurchasing] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const shopData = generateDailyShop(new Date());
        setShop(shopData);

        const timer = setInterval(() => {
            setCountdown(formatCountdown(getTimeUntilRestock()));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    async function handlePurchase(item) {
        if (purchasing) return;
        if (duckBucks < item.price) {
            setMessage('Not enough Duck Bucks!');
            return;
        }
        setPurchasing(item.slotIndex);
        setMessage('');
        const egg = await purchaseEgg(item.itemId, item.price);
        setPurchasing(null);
        if (egg) {
            setMessage(`Purchased ${item.name}! Check your Collection Pond.`);
        } else {
            setMessage('Purchase failed. Not enough Duck Bucks.');
        }
    }

    return (
        <div className="waddle-overlay shop-screen">
            <div className="screen-header">
                <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                <h2>Daily Shop</h2>
            </div>

            {/* Currency display */}
            <div className="shop-currency">
                <span className="currency-bucks">{duckBucks} Duck Bucks</span>
                <span className="currency-eggs">{goldenEggs} Golden Eggs</span>
            </div>

            {/* Countdown to restock */}
            <div className="shop-restock">
                Restocks in: <strong>{countdown}</strong>
            </div>

            {/* Shop items */}
            <div className="shop-grid">
                {shop?.items.map(item => {
                    const eggInfo = getEggById(item.itemId);
                    return (
                        <div
                            key={item.slotIndex}
                            className={`shop-item ${item.rarity}`}
                        >
                            <div className="shop-item-display">
                                <div
                                    className="shop-egg-shape"
                                    style={{ backgroundColor: item.color }}
                                >
                                    <span className="egg-label">&#129370;</span>
                                </div>
                            </div>
                            <h4 className="shop-item-name">{item.name}</h4>
                            <p className="shop-item-desc">{item.description}</p>
                            {item.rarity === 'rare' && (
                                <span className="badge badge-rare-shop">Rare!</span>
                            )}
                            <button
                                className="waddle-btn waddle-btn-primary shop-buy-btn"
                                onClick={() => handlePurchase(item)}
                                disabled={purchasing !== null || duckBucks < item.price}
                            >
                                {purchasing === item.slotIndex ? 'Buying...' : `${item.price} DB`}
                            </button>
                        </div>
                    );
                })}
            </div>

            {message && <p className="shop-message">{message}</p>}
        </div>
    );
}
