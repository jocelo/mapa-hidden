class StartScene extends Phaser.Scene {
    constructor() {
        super('landingPage');
    }

    create() {
        this.add.text(200, 200, 'Start screen');
        console.log('go to!! gamingPage');
        this.scene.start('gamingPage');
    }
}