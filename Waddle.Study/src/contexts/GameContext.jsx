import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as db from '../firebase/firestore';
import { rollDuck, rollRewardEgg, rollQuizRewardType } from '../data/gacha';
import { calculateDuckBucks, earnedGoldenEgg } from '../utils/economy';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const { userData, uid, refreshUser } = useAuth();
    const [currentScreen, setCurrentScreen] = useState('HUB');
    const [screenData, setScreenData] = useState({});
    const screenStackRef = useRef([]);
    const currentScreenRef = useRef(currentScreen);

    useEffect(() => {
        currentScreenRef.current = currentScreen;
    }, [currentScreen]);

    // Navigation with data — uses ref to avoid stale closure
    const navigate = useCallback((screen, data = null) => {
        screenStackRef.current = [...screenStackRef.current, currentScreenRef.current];
        setCurrentScreen(screen);
        if (data) {
            setScreenData(prev => ({ ...prev, [screen]: data }));
        }
    }, []);

    const goBack = useCallback(() => {
        const stack = screenStackRef.current;
        if (stack.length === 0) {
            setCurrentScreen('HUB');
        } else {
            const newStack = [...stack];
            const prev = newStack.pop();
            screenStackRef.current = newStack;
            setCurrentScreen(prev);
        }
    }, []);

    // Economy
    const addBucks = useCallback(async (amount) => {
        if (!uid) return;
        await db.addDuckBucks(uid, amount);
        await refreshUser();
    }, [uid, refreshUser]);

    const spendBucks = useCallback(async (amount) => {
        if (!uid) return false;
        const success = await db.spendDuckBucks(uid, amount);
        if (success) await refreshUser();
        return success;
    }, [uid, refreshUser]);

    const addGolden = useCallback(async (amount) => {
        if (!uid) return;
        await db.addGoldenEggs(uid, amount);
        await refreshUser();
    }, [uid, refreshUser]);

    // Inventory
    const openEgg = useCallback(async (eggInstance) => {
        if (!uid) return null;
        const duck = rollDuck(eggInstance.eggId);
        await db.removeEggFromInventory(uid, eggInstance);
        await db.addDuckToInventory(uid, duck);
        await refreshUser();
        return duck;
    }, [uid, refreshUser]);

    const addEgg = useCallback(async (egg) => {
        if (!uid) return;
        await db.addEggToInventory(uid, egg);
        await refreshUser();
    }, [uid, refreshUser]);

    // Display duck
    const setDisplayDuck = useCallback(async (duckInstanceId) => {
        if (!uid) return;
        await db.setDisplayDuck(uid, duckInstanceId);
        await refreshUser();
    }, [uid, refreshUser]);

    // Quiz completion
    const completeQuiz = useCallback(async (correct, total, options = {}) => {
        if (!uid) return null;
        const { dojoId = null, isMandatory = false, isBonusBounty = false, setId = null } = options;

        const rewardType = rollQuizRewardType();
        const result = {
            correct,
            total,
            percentage: Math.round((correct / total) * 100),
            rewardType,
            duckBucks: 0,
            egg: null,
            goldenEgg: false,
        };

        if (rewardType === 'egg') {
            const egg = rollRewardEgg();
            await db.addEggToInventory(uid, egg);
            result.egg = egg;
        } else {
            const bucks = calculateDuckBucks(correct, total, {
                isDojo: !!dojoId,
                isBonusBounty,
            });
            await db.addDuckBucks(uid, bucks);
            result.duckBucks = bucks;
        }

        // Perfect score = golden egg currency
        if (earnedGoldenEgg(correct, total)) {
            await db.addGoldenEggs(uid, 1);
            result.goldenEgg = true;
        }

        // Save result record
        await db.saveQuizResult(uid, {
            setId,
            dojoId,
            correct,
            total,
            percentage: result.percentage,
            rewardType,
            duckBucks: result.duckBucks,
            eggId: result.egg?.eggId || null,
            goldenEgg: result.goldenEgg,
        });

        await refreshUser();
        return result;
    }, [uid, refreshUser]);

    // Purchase egg from shop
    const purchaseEgg = useCallback(async (eggId, price) => {
        if (!uid) return false;
        const success = await db.spendDuckBucks(uid, price);
        if (!success) return false;
        const egg = {
            instanceId: `${eggId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            eggId,
            obtainedAt: Date.now(),
        };
        await db.addEggToInventory(uid, egg);
        await refreshUser();
        return egg;
    }, [uid, refreshUser]);

    const value = {
        // Navigation
        currentScreen,
        setCurrentScreen,
        screenData,
        navigate,
        goBack,
        // Economy
        duckBucks: userData?.economy?.duckBucks || 0,
        goldenEggs: userData?.economy?.goldenEggs || 0,
        ducks: userData?.inventory?.ducks || [],
        eggs: userData?.inventory?.eggs || [],
        displayDuckId: userData?.profile?.displayDuckId || null,
        enrolledDojos: userData?.enrolledDojos || [],
        // Actions
        addBucks,
        spendBucks,
        addGolden,
        openEgg,
        addEgg,
        setDisplayDuck,
        completeQuiz,
        purchaseEgg,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used within GameProvider');
    return ctx;
}
