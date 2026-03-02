import { EventBus } from '../EventBus';
import Phaser from 'phaser';

const { Scene } = Phaser;

// Zone layout:
//   Shop (top-left)       Collection (top-right)
//   Atlas (left)          Duck Dojo (right)
//   Workshop (bot-left)   Quizzes (bot-right)
const ZONES = [
    { name: 'shop',       x: 110, y: 55,  label: 'Shop',       icon: '\u{1F6D2}' },
    { name: 'collection', x: 530, y: 55,  label: 'Collection', icon: '\u{1F426}' },
    { name: 'atlas',      x: 60,  y: 180, label: 'Atlas',      icon: '\u{1F30E}' },
    { name: 'dojo',       x: 580, y: 180, label: 'Duck Dojo',  icon: '\u{1F3CB}' },
    { name: 'workshop',   x: 110, y: 305, label: 'Workshop',   icon: '\u270E'    },
    { name: 'quizzes',    x: 530, y: 305, label: 'Quizzes',    icon: '\u2753'    },
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
            this.add.text(zone.x, zone.y, zone.icon, {
                fontSize: '20px',
            }).setOrigin(0.5);
        });

        // ─── Player duck ───────────────────────────────────────
        // Use a container that holds the duck graphic. Movement changes
        // the container position; a separate bob offset is applied to a
        // child so it doesn't fight with the position logic.
        this.duckX = w / 2;
        this.duckY = h / 2;
        this.bobOffset = 0;

        this.playerDuck = this.add.container(this.duckX, this.duckY);

        // Inner container that bobs (child of playerDuck)
        this.duckInner = this.add.container(0, 0);
        this.playerDuck.add(this.duckInner);

        // Draw the duck with a given color (default yellow)
        this.duckColor = 0xffeb3b;
        this.duckName = 'The Classic';
        this._drawDuck();

        // Bob tween — only affects the inner container's y
        this.tweens.add({
            targets: this.duckInner,
            y: -3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ─── Input — keyboard ──────────────────────────────────
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

        // ─── Listen for duck-changed from React ────────────────
        EventBus.on('display-duck-changed', this._onDuckChanged, this);

        EventBus.emit('current-scene-ready', this);
    }

    /** Redraws the duck graphic inside duckInner */
    _drawDuck() {
        this.duckInner.removeAll(true);

        const gfx = this.add.graphics();
        const c = this.duckColor;

        // Body
        gfx.fillStyle(c);
        gfx.fillEllipse(0, 4, 24, 20);
        // Head
        gfx.fillStyle(c);
        gfx.fillCircle(0, -8, 10);
        // Beak
        gfx.fillStyle(0xffb300);
        gfx.fillEllipse(0, -4, 8, 4);
        // Eyes
        gfx.fillStyle(0x121212);
        gfx.fillCircle(-3, -10, 2);
        gfx.fillCircle(3, -10, 2);
        // Eye shine
        gfx.fillStyle(0xffffff);
        gfx.fillCircle(-2.5, -10.5, 0.8);
        gfx.fillCircle(3.5, -10.5, 0.8);
        // Wing (slightly darker shade implied by opacity)
        gfx.fillStyle(c, 0.7);
        gfx.fillEllipse(-7, 3, 10, 14);
        // Tail
        gfx.fillStyle(c, 0.8);
        gfx.fillTriangle(12, 0, 18, -6, 16, 4);

        this.duckInner.add(gfx);

        // Name label under duck
        const label = this.add.text(0, 18, this.duckName, {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '6px',
            color: '#ffffff',
            stroke: '#003b59',
            strokeThickness: 2,
        }).setOrigin(0.5);
        this.duckInner.add(label);
    }

    /** Called when React emits a duck change */
    _onDuckChanged({ color, name }) {
        // Convert hex color string (#rrggbb) to Phaser integer
        if (color) {
            this.duckColor = Phaser.Display.Color.HexStringToColor(color).color;
        }
        if (name) {
            this.duckName = name;
        }
        this._drawDuck();
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
            const dx = this.moveTarget.x - this.duckX;
            const dy = this.moveTarget.y - this.duckY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 4) {
                vx = dx / dist;
                vy = dy / dist;
            } else {
                this.moveTarget = null;
            }
        }

        // Apply movement
        if (vx !== 0 || vy !== 0) {
            const len = Math.sqrt(vx * vx + vy * vy);
            const moveX = (vx / len) * DUCK_SPEED * dt;
            const moveY = (vy / len) * DUCK_SPEED * dt;

            this.duckX += moveX;
            this.duckY += moveY;

            // Flip duck based on horizontal direction
            if (vx < -0.1) this.playerDuck.setScale(-1, 1);
            else if (vx > 0.1) this.playerDuck.setScale(1, 1);
        }

        // Clamp to bounds
        this.duckX = Phaser.Math.Clamp(this.duckX, 20, 620);
        this.duckY = Phaser.Math.Clamp(this.duckY, 20, 340);

        // Apply position (the bob tween only affects duckInner.y, not playerDuck.y)
        this.playerDuck.x = this.duckX;
        this.playerDuck.y = this.duckY;

        // ─── Zone proximity ────────────────────────────────────
        let nearestZone = null;
        let nearestDist = Infinity;

        for (const zone of ZONES) {
            const dx = this.duckX - zone.x;
            const dy = this.duckY - zone.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ZONE_RADIUS && dist < nearestDist) {
                nearestDist = dist;
                nearestZone = zone.name;
            }
        }

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

    shutdown() {
        EventBus.off('display-duck-changed', this._onDuckChanged, this);
    }

    changeScene(sceneName) {
        this.scene.start(sceneName);
    }
}
