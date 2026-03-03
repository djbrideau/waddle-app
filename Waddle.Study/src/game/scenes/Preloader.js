import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Loading bar
        this.add.rectangle(320, 180, 300, 20).setStrokeStyle(2, 0x00e5ff);
        const bar = this.add.rectangle(320 - 146, 180, 4, 14, 0x00e5ff);
        this.load.on('progress', (p) => {
            bar.width = 4 + (292 * p);
        });
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('bg-beta', 'Assets/images/backgrounds/backgroundbeta.png');
        this.load.image('logo', 'Assets/Logos/BetaWaddleLogo.png');
        this.load.image('duck_classic', 'Assets/images/ducks/betaduck.png');
    }

    create() {
        this.scene.start('TitleScene');
    }
}
