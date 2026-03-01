import { EventBus } from '../EventBus';
import Phaser from 'phaser';

const { Scene } = Phaser;

export class HubScene extends Scene {
    constructor() {
        super('HubScene');
    }

    create() {
        const w = 640, h = 360;

        // Pool/water background with tropical vibe
        const bgGfx = this.add.graphics();
        for (let y = 0; y < h; y++) {
            const t = y / h;
            const r = Math.round(0 + t * 0);
            const g = Math.round(168 + t * (100 - 168));
            const b = Math.round(204 + t * (148 - 204));
            bgGfx.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
            bgGfx.fillRect(0, y, w, 1);
        }

        // Pool edge / border decoration
        const poolEdge = this.add.graphics();
        poolEdge.fillStyle(0xf5f5dc, 0.6);
        poolEdge.fillRect(0, 0, w, 8);
        poolEdge.fillRect(0, h - 8, w, 8);
        poolEdge.fillRect(0, 0, 8, h);
        poolEdge.fillRect(w - 8, 0, 8, h);

        // Corner decorations (palm-ish shapes)
        poolEdge.fillStyle(0x2e7d32, 0.5);
        poolEdge.fillTriangle(0, 0, 50, 0, 0, 50);
        poolEdge.fillTriangle(w, 0, w - 50, 0, w, 50);
        poolEdge.fillTriangle(0, h, 50, h, 0, h - 50);
        poolEdge.fillTriangle(w, h, w - 50, h, w, h - 50);

        // Animated water ripples
        this.ripples = [];
        for (let i = 0; i < 8; i++) {
            const ripple = this.add.circle(
                80 + Math.random() * 480,
                60 + Math.random() * 240,
                8 + Math.random() * 12,
            );
            ripple.setStrokeStyle(1, 0x00e5ff, 0.2);
            ripple.setFillStyle(0x00e5ff, 0.05);
            this.ripples.push(ripple);

            this.tweens.add({
                targets: ripple,
                scaleX: 2,
                scaleY: 2,
                alpha: 0,
                duration: 3000 + Math.random() * 2000,
                repeat: -1,
                delay: Math.random() * 3000,
                onRepeat: () => {
                    ripple.setScale(1);
                    ripple.setAlpha(0.3);
                    ripple.setPosition(80 + Math.random() * 480, 60 + Math.random() * 240);
                }
            });
        }

        EventBus.emit('current-scene-ready', this);
    }

    changeScene(sceneName) {
        this.scene.start(sceneName);
    }
}
