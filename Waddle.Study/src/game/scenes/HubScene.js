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

        // ─── Background image ────────────────────────────────────
        this.add.image(w / 2, h / 2, 'bg-beta').setDisplaySize(w, h);

        // ─── Zone indicators with floating effect ────────────────
        this.zoneGraphics = [];
        this.zoneContainers = [];

        ZONES.forEach(zone => {
            // Graphics for the proximity highlight ring
            const gfx = this.add.graphics();
            gfx.lineStyle(2, 0x00e5ff, 0.3);
            gfx.strokeCircle(zone.x, zone.y, ZONE_RADIUS);
            this.zoneGraphics.push(gfx);

            // Container for the label + icon (will float)
            const zoneContainer = this.add.container(zone.x, zone.y);

            // Zone label
            const label = this.add.text(0, -ZONE_RADIUS - 10, zone.label, {
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '8px',
                color: '#f5f5dc',
                stroke: '#003b59',
                strokeThickness: 3,
            }).setOrigin(0.5);
            zoneContainer.add(label);

            // Zone icon
            const icon = this.add.text(0, 0, zone.icon, {
                fontSize: '20px',
            }).setOrigin(0.5);
            zoneContainer.add(icon);

            this.zoneContainers.push(zoneContainer);

            // Float animation for zone
            this.tweens.add({
                targets: zoneContainer,
                y: zone.y - 4,
                duration: 1500 + Math.random() * 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        });

        // ─── Player duck ─────────────────────────────────────────
        this.duckX = w / 2;
        this.duckY = h / 2;

        // Outer container — this gets position updates and horizontal flip
        this.playerDuck = this.add.container(this.duckX, this.duckY);

        // Inner container — holds sprite, bobs up/down, flips with parent
        this.duckInner = this.add.container(0, 0);
        this.playerDuck.add(this.duckInner);

        // The duck sprite (betaduck.png is 64x64, scale down for pool)
        this.duckSprite = this.add.image(0, 0, 'duck_classic')
            .setDisplaySize(40, 40);
        this.duckInner.add(this.duckSprite);

        // Name label — sits OUTSIDE duckInner so it doesn't flip
        // It's a direct child of playerDuck but we counter-scale it in update()
        this.nameLabel = this.add.text(0, 24, '', {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '6px',
            color: '#ffffff',
            stroke: '#003b59',
            strokeThickness: 2,
        }).setOrigin(0.5);
        // We do NOT add nameLabel to playerDuck; we position it manually in
        // update() so it's never flipped. It lives at the scene level.

        // Bob tween — only on the inner container
        this.tweens.add({
            targets: this.duckInner,
            y: -3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Track current facing direction for label correction
        this.facingLeft = false;

        // ─── Input — keyboard ────────────────────────────────────
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Click to move
        this.input.on('pointerdown', (pointer) => {
            if (this.currentZone) {
                EventBus.emit('zone-activate', this.currentZone);
                return;
            }
            this.moveTarget = { x: pointer.worldX, y: pointer.worldY };
        });

        // Space to activate zone
        this.spaceKey.on('down', () => {
            if (this.currentZone) {
                EventBus.emit('zone-activate', this.currentZone);
            }
        });

        // ─── Listen for display-duck-changed from React ──────────
        EventBus.on('display-duck-changed', this._onDuckChanged, this);

        EventBus.emit('current-scene-ready', this);
    }

    /** Called when React emits a duck change */
    _onDuckChanged({ name }) {
        // For now all ducks use the beta duck sprite; name is the user's first name
        if (name !== undefined) {
            this.nameLabel.setText(name);
        }
    }

    update(time, delta) {
        if (!this.playerDuck) return;

        const dt = delta / 1000;
        let vx = 0, vy = 0;

        // Keyboard input
        const left = this.cursors.left.isDown || this.wasd.left.isDown;
        const right = this.cursors.right.isDown || this.wasd.right.isDown;
        const up = this.cursors.up.isDown || this.wasd.up.isDown;
        const down = this.cursors.down.isDown || this.wasd.down.isDown;

        if (left) vx -= 1;
        if (right) vx += 1;
        if (up) vy -= 1;
        if (down) vy += 1;

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
            this.duckX += (vx / len) * DUCK_SPEED * dt;
            this.duckY += (vy / len) * DUCK_SPEED * dt;

            // Flip duck sprite based on horizontal direction
            if (vx < -0.1) {
                this.playerDuck.setScale(-1, 1);
                this.facingLeft = true;
            } else if (vx > 0.1) {
                this.playerDuck.setScale(1, 1);
                this.facingLeft = false;
            }
        }

        // Clamp to bounds
        this.duckX = Phaser.Math.Clamp(this.duckX, 20, 620);
        this.duckY = Phaser.Math.Clamp(this.duckY, 20, 340);

        // Apply position
        this.playerDuck.x = this.duckX;
        this.playerDuck.y = this.duckY;

        // Position the name label below the duck — always left-to-right readable
        this.nameLabel.x = this.duckX;
        this.nameLabel.y = this.duckY + 24;

        // ─── Zone proximity ──────────────────────────────────────
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
            if (this.currentZone) EventBus.emit('zone-leave', this.currentZone);
            this.currentZone = nearestZone;
            if (this.currentZone) EventBus.emit('zone-enter', this.currentZone);
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
