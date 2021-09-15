class GameOverScene extends Phaser.Scene {
    constructor() {
        super('donePage');
    }

    init(data) {
        this.winner = data.winner;
    }

    create() {
        var congratulate_msg = 'something unexpected happened';

        var winningMessages = {
            'self': 'You won!',
            'tie': 'It\'s a tie!',
            'oponent': 'Your oponent won!'
        };

        if (this.winner in winningMessages) {
            congratulate_msg = winningMessages[this.winner];
        }

        this.add.text(WIN_WIDTH / 2, WIN_HEIGHT * .3, congratulate_msg);
        var text2 = this.add.text(WIN_WIDTH / 2, WIN_HEIGHT * .4, congratulate_msg);
        text2.align = 'center';
        this.add.text(WIN_WIDTH / 2, WIN_HEIGHT * 0.6, 'Click to play again.');

        this.input.on('pointerup', function () {
            // this.scene.start('');
            var mainScene = this.scene.get('gamingPage');
            mainScene.reset_scope();

            this.scene.transition({ target: 'gamingPage', duration: 500 });
        }, this);
    }
}