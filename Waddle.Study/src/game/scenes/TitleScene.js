import { EventBus } from '../EventBus';
import Phaser from 'phaser';

const { Scene } = Phaser;

export class TitleScene extends Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        const w = 640, h = 360;

        // Background image
        this.add.image(w / 2, h / 2, 'bg-beta').setDisplaySize(w, h);

        // Logo centered
        this.add.image(w / 2, h / 2 - 20, 'logo').setDisplaySize(180, 180);

        // Small floating duck at the bottom
        const duck = this.add.image(w / 2, h / 2 + 100, 'duck_classic')
            .setDisplaySize(48, 48);

        this.tweens.add({
            targets: duck,
            y: h / 2 + 95,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene(sceneName) {
        this.scene.start(sceneName);
    }
}
