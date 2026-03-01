import { EventBus } from '../EventBus';
import Phaser from 'phaser';

const { Scene } = Phaser;

export class TitleScene extends Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        const w = 640, h = 360;

        // Sky gradient (top half)
        const skyGfx = this.add.graphics();
        for (let y = 0; y < h * 0.55; y++) {
            const t = y / (h * 0.55);
            const r = Math.round(0 + t * 0);
            const g = Math.round(58 + t * (100 - 58));
            const b = Math.round(89 + t * (148 - 89));
            skyGfx.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
            skyGfx.fillRect(0, y, w, 1);
        }

        // Ocean body
        const oceanY = h * 0.55;
        const oceanGfx = this.add.graphics();
        for (let y = oceanY; y < h; y++) {
            const t = (y - oceanY) / (h - oceanY);
            const r = Math.round(0 + t * 0);
            const g = Math.round(100 + t * (59 - 100));
            const b = Math.round(148 + t * (89 - 148));
            oceanGfx.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
            oceanGfx.fillRect(0, y, w, 1);
        }

        // Animated wave lines
        this.waves = [];
        for (let i = 0; i < 5; i++) {
            const waveY = oceanY + 15 + i * 25;
            const wave = this.add.graphics();
            this.waves.push({ gfx: wave, baseY: waveY, offset: i * 1.2, speed: 0.8 + i * 0.15 });
        }

        // Sun
        const sun = this.add.circle(520, 60, 35, 0xffeb3b);
        sun.setAlpha(0.9);
        this.tweens.add({
            targets: sun,
            alpha: 0.6,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Dock (simple brown rectangle platform)
        const dockGfx = this.add.graphics();
        dockGfx.fillStyle(0x5d4037);
        dockGfx.fillRect(w / 2 - 100, h * 0.48, 200, 18);
        // Dock planks
        dockGfx.fillStyle(0x8d6e63);
        for (let i = 0; i < 5; i++) {
            dockGfx.fillRect(w / 2 - 96 + i * 40, h * 0.48 + 2, 36, 14);
        }
        // Dock posts
        dockGfx.fillStyle(0x3e2723);
        dockGfx.fillRect(w / 2 - 90, h * 0.48 + 18, 8, 30);
        dockGfx.fillRect(w / 2 + 82, h * 0.48 + 18, 8, 30);

        this.time.addEvent({
            delay: 16,
            loop: true,
            callback: () => this.updateWaves(),
        });

        EventBus.emit('current-scene-ready', this);
    }

    updateWaves() {
        const time = this.time.now / 1000;
        for (const wave of this.waves) {
            wave.gfx.clear();
            wave.gfx.lineStyle(2, 0x00a8cc, 0.3);
            wave.gfx.beginPath();
            for (let x = 0; x < 640; x += 4) {
                const y = wave.baseY + Math.sin((x / 80) + time * wave.speed + wave.offset) * 4;
                if (x === 0) wave.gfx.moveTo(x, y);
                else wave.gfx.lineTo(x, y);
            }
            wave.gfx.strokePath();
        }
    }

    changeScene(sceneName) {
        this.scene.start(sceneName);
    }
}
