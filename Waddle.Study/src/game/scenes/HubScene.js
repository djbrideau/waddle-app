import { EventBus } from '../EventBus';
import Phaser from 'phaser';

const { Scene } = Phaser;

// Zone definitions: positions around the pool for menu landmarks
const ZONES = [
    { name: 'workshop',  x: 320, y: 40,  label: 'Workshop' },
    { name: 'dojo',      x: 320, y: 320, label: 'Duck Dojo' },
    { name: 'atlas',     x: 50,  y: 180, label: 'Atlas' },
    { name: 'quizzes',   x: 590, y: 180, label: 'Quizzes' },
    { name: 'shop',      x: 100, y: 50,  label: 'Shop' },
    { name: 'collection',x: 540, y: 320, label: 'Collection' },
];

const ZONE_RADIUS = 50;
const DUCK_SPEED = 150;

export class HubScene extends Scene {
    constructor() {
        super('HubScene');
        this.currentZone = null;
        this.moveTarget = null;
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

        // Draw zone indicators (subtle circles with labels)
        this.zoneGraphics = [];
        ZONES.forEach(zone => {
            const gfx = this.add.graphics();
            gfx.lineStyle(2, 0x00e5ff, 0.3);
            gfx.strokeCircle(zone.x, zone.y, ZONE_RADIUS);
            this.zoneGraphics.push(gfx);

            // Zone label
            this.add.text(zone.x, zone.y - ZONE_RADIUS - 10, zone.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '8px',
                color: '#f5f5dc',
                stroke: '#003b59',
                strokeThickness: 3,
            }).setOrigin(0.5);

            // Zone icon
            const icons = {
                workshop: '✎', dojo: '🏋', atlas: '🌎',
                quizzes: '❓', shop: '🛒', collection: '🐦',
            };
            this.add.text(zone.x, zone.y, icons[zone.name] || '●', {
                fontSize: '20px',
            }).setOrigin(0.5);
        });

        // Create player duck (simple graphic)
        this.playerDuck = this.add.container(w / 2, h / 2);

        // Duck body
        const duckGfx = this.add.graphics();
        // Body
        duckGfx.fillStyle(0xffeb3b);
        duckGfx.fillEllipse(0, 4, 24, 20);
        // Head
        duckGfx.fillStyle(0xffeb3b);
        duckGfx.fillCircle(0, -8, 10);
        // Beak
        duckGfx.fillStyle(0xffb300);
        duckGfx.fillEllipse(0, -4, 8, 4);
        // Eyes
        duckGfx.fillStyle(0x121212);
        duckGfx.fillCircle(-3, -10, 2);
        duckGfx.fillCircle(3, -10, 2);
        // Eye shine
        duckGfx.fillStyle(0xffffff);
        duckGfx.fillCircle(-2.5, -10.5, 0.8);
        duckGfx.fillCircle(3.5, -10.5, 0.8);

        this.playerDuck.add(duckGfx);

        // Name label under duck
        const nameLabel = this.add.text(0, 18, 'You', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '6px',
            color: '#ffffff',
            stroke: '#003b59',
            strokeThickness: 2,
        }).setOrigin(0.5);
        this.playerDuck.add(nameLabel);

        // Bob animation
        this.tweens.add({
            targets: this.playerDuck,
            y: this.playerDuck.y - 3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Input — keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Input — click to move
        this.input.on('pointerdown', (pointer) => {
            // Check if duck is near a zone — if so, activate the zone instead
            if (this.currentZone) {
                EventBus.emit('zone-activate', this.currentZone);
                return;
            }
            this.moveTarget = { x: pointer.worldX, y: pointer.worldY };
        });

        // Space to activate current zone
        this.spaceKey.on('down', () => {
            if (this.currentZone) {
                EventBus.emit('zone-activate', this.currentZone);
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    update(time, delta) {
        if (!this.playerDuck) return;

        const dt = delta / 1000;
        let vx = 0, vy = 0;

        // Keyboard input (arrow keys + WASD)
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        if (left) vx -= 1;
        if (right) vx += 1;
        if (up) vy -= 1;
        if (down) vy += 1;

        // If keyboard is being used, cancel click-to-move
        if (vx !== 0 || vy !== 0) {
            this.moveTarget = null;
        }

        // Click-to-move
        if (this.moveTarget && vx === 0 && vy === 0) {
            const dx = this.moveTarget.x - this.playerDuck.x;
            const dy = this.moveTarget.y - this.playerDuck.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 4) {
                vx = dx / dist;
                vy = dy / dist;
            } else {
                this.moveTarget = null;
            }
        }

        // Normalize diagonal movement
        if (vx !== 0 || vy !== 0) {
            const len = Math.sqrt(vx * vx + vy * vy);
            vx = (vx / len) * DUCK_SPEED * dt;
            vy = (vy / len) * DUCK_SPEED * dt;

            this.playerDuck.x += vx;
            this.playerDuck.y += vy;

            // Flip duck based on direction
            if (vx < -0.1) this.playerDuck.setScale(-1, 1);
            else if (vx > 0.1) this.playerDuck.setScale(1, 1);
        }

        // Clamp to bounds
        this.playerDuck.x = Phaser.Math.Clamp(this.playerDuck.x, 20, 620);
        this.playerDuck.y = Phaser.Math.Clamp(this.playerDuck.y, 20, 340);

        // Check proximity to zones
        let nearestZone = null;
        let nearestDist = Infinity;

        for (const zone of ZONES) {
            const dx = this.playerDuck.x - zone.x;
            const dy = this.playerDuck.y - zone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ZONE_RADIUS && dist < nearestDist) {
                nearestDist = dist;
                nearestZone = zone.name;
            }
        }

        // Emit zone events
        if (nearestZone !== this.currentZone) {
            if (this.currentZone) {
                EventBus.emit('zone-leave', this.currentZone);
            }
            this.currentZone = nearestZone;
            if (this.currentZone) {
                EventBus.emit('zone-enter', this.currentZone);
            }
        }

        // Highlight active zone
        this.zoneGraphics.forEach((gfx, i) => {
            gfx.clear();
            const zone = ZONES[i];
            if (zone.name === this.currentZone) {
                gfx.lineStyle(3, 0x00e5ff, 0.8);
                gfx.strokeCircle(zone.x, zone.y, ZONE_RADIUS);
                gfx.lineStyle(1, 0x00e5ff, 0.3);
                gfx.strokeCircle(zone.x, zone.y, ZONE_RADIUS + 5);
            } else {
                gfx.lineStyle(2, 0x00e5ff, 0.3);
                gfx.strokeCircle(zone.x, zone.y, ZONE_RADIUS);
            }
        });
    }

    changeScene(sceneName) {
        this.scene.start(sceneName);
    }
}
