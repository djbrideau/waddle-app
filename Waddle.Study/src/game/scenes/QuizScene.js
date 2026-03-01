import { EventBus } from '../EventBus';
import Phaser from 'phaser';

const { Scene } = Phaser;

export class QuizScene extends Scene {
    constructor() {
        super('QuizScene');
    }

    create() {
        const w = 640, h = 360;

        // Wood/sand background
        const bgGfx = this.add.graphics();
        for (let y = 0; y < h; y++) {
            const t = y / h;
            const r = Math.round(141 + t * (93 - 141));
            const g = Math.round(110 + t * (78 - 110));
            const b = Math.round(99 + t * (65 - 99));
            bgGfx.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
            bgGfx.fillRect(0, y, w, 1);
        }

        // Wood grain lines
        const grainGfx = this.add.graphics();
        grainGfx.lineStyle(1, 0x5d4037, 0.15);
        for (let i = 0; i < 12; i++) {
            const y = 20 + i * 30 + Math.random() * 10;
            grainGfx.beginPath();
            for (let x = 0; x < w; x += 8) {
                const gy = y + Math.sin(x / 60 + i) * 3;
                if (x === 0) grainGfx.moveTo(x, gy);
                else grainGfx.lineTo(x, gy);
            }
            grainGfx.strokePath();
        }

        EventBus.emit('current-scene-ready', this);
    }

    changeScene(sceneName) {
        this.scene.start(sceneName);
    }
}
