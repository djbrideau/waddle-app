import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { TitleScene } from './scenes/TitleScene';
import { HubScene } from './scenes/HubScene';
import { QuizScene } from './scenes/QuizScene';
import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    parent: 'game-container',
    backgroundColor: '#003b59',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        Boot,
        Preloader,
        TitleScene,
        HubScene,
        QuizScene,
    ]
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;
