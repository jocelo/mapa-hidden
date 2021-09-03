class GameOverScene extends Phaser.Scene {
    constructor() {
        super('donePage');
    }

    create() {
        this.add.text(200, 200, 'Game Over screen');
    }
}