import { useRef, useEffect } from 'react';
import { PhaserGame } from './PhaserGame';
import { useAuth } from './contexts/AuthContext';
import { useGame } from './contexts/GameContext';

import LoginScreen from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';
import RoleSelect from './components/RoleSelect';
import HubScreen from './components/HubScreen';
import Workshop from './components/Workshop';
import QuestionSets from './components/QuestionSets';
import QuizGame from './components/QuizGame';
import QuizResults from './components/QuizResults';
import DojoStudent from './components/DojoStudent';
import DojoTeacher from './components/DojoTeacher';
import Shop from './components/Shop';
import CollectionPond from './components/CollectionPond';
import EggOpening from './components/EggOpening';
import Settings from './components/Settings';
import AtlasPlaceholder from './components/AtlasPlaceholder';

const SCENE_MAP = {
    LOGIN: 'TitleScene',
    SPLASH: 'TitleScene',
    ROLE_SELECT: 'TitleScene',
    HUB: 'HubScene',
    WORKSHOP: 'HubScene',
    QUESTION_SETS: 'HubScene',
    QUIZ: 'QuizScene',
    QUIZ_RESULTS: 'HubScene',
    DOJO: 'HubScene',
    SHOP: 'HubScene',
    COLLECTION: 'HubScene',
    EGG_OPENING: 'HubScene',
    SETTINGS: 'HubScene',
    ATLAS: 'HubScene',
};

function App() {
    const phaserRef = useRef();
    const { firebaseUser, userData, loading, needsRoleSelect } = useAuth();
    const { currentScreen, screenData } = useGame();

    // Sync Phaser scene with current screen — uses game instance directly
    useEffect(() => {
        const game = phaserRef.current?.game;
        if (!game || !game.scene) return;

        const targetScene = SCENE_MAP[currentScreen] || 'HubScene';
        const activeScenes = game.scene.getScenes(true);
        const isTargetActive = activeScenes.some(s => s.scene.key === targetScene);

        if (!isTargetActive) {
            try {
                game.scene.start(targetScene);
                // Stop other scenes that aren't the target
                activeScenes.forEach(s => {
                    if (s.scene.key !== targetScene && s.scene.key !== 'Boot' && s.scene.key !== 'Preloader') {
                        game.scene.stop(s.scene.key);
                    }
                });
            } catch (e) {
                // Scene transition may fail during init
            }
        }
    }, [currentScreen]);

    const handleSceneReady = () => {};

    function renderScreen() {
        if (loading) return <LoadingScreen />;
        if (!firebaseUser) return <LoginScreen />;
        if (needsRoleSelect) return <RoleSelect />;
        if (!userData) return <LoadingScreen />;

        switch (currentScreen) {
            case 'SPLASH':
                return <SplashScreen />;
            case 'HUB':
                return <HubScreen />;
            case 'WORKSHOP':
                return <Workshop />;
            case 'QUESTION_SETS':
                return <QuestionSets />;
            case 'QUIZ': {
                const data = screenData.QUIZ || {};
                return (
                    <QuizGame
                        setId={data.setId}
                        dojoId={data.dojoId}
                        isMandatory={data.isMandatory}
                        isBonusBounty={data.isBonusBounty}
                    />
                );
            }
            case 'QUIZ_RESULTS': {
                const data = screenData.QUIZ_RESULTS || {};
                return <QuizResults result={data.result} />;
            }
            case 'DOJO':
                return userData.role === 'teacher' ? <DojoTeacher /> : <DojoStudent />;
            case 'SHOP':
                return <Shop />;
            case 'COLLECTION':
                return <CollectionPond />;
            case 'EGG_OPENING': {
                const data = screenData.EGG_OPENING || {};
                return <EggOpening egg={data.egg} />;
            }
            case 'SETTINGS':
                return <Settings />;
            case 'ATLAS':
                return <AtlasPlaceholder />;
            default:
                return <HubScreen />;
        }
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={handleSceneReady} />
            <div id="ui-overlay">
                {renderScreen()}
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div className="waddle-overlay loading-screen">
            <div className="loading-content">
                <h2 className="loading-title">WADDLE</h2>
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        </div>
    );
}

export default App;
