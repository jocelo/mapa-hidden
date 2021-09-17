class GameOverScene extends Phaser.Scene {
    constructor() {
        super('donePage');
    }

    init(data) {
        this.winner = data.winner;

        var element = document.createElement('style');
        document.head.appendChild(element);
        var sheet = element.sheet;
        var styles = '@font-face { font-family: "LuckiestGuy"; src: url("assets/fonts/LuckiestGuy-Regular.ttf") format("opentype"); }\n';
        sheet.insertRule(styles, 0);
        styles = '@font-face { font-family: "HammersmithOne"; src: url("assets/fonts/HammersmithOne-Regular.ttf") format("opentype"); }\n';
        sheet.insertRule(styles, 0);
    }

    preload() {
        this.load.image('backgroundd', 'assets/bg_win_blue.png');
        this.load.image('button', 'assets/button_blue.png');
        this.load.image('panel', 'assets/panel_blue.png');
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {
        var add = this.add;
        var input = this.input;
        var bg_pos = {
            x: WIN_WIDTH / 2,
            y: (WIN_HEIGHT / 2) - 50
        };

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

        var bg = this.add.image(bg_pos.x, bg_pos.y, 'backgroundd');
        bg.setScale(0.5);

        var btn_again = this.add.image(bg_pos.x, bg_pos.y, 'button')
            .setScale(0.4);
        btn_again.setInteractive();
        btn_again.on('clicked', function () { console.log('caca'); }, this);

        add.image(bg_pos.x, bg_pos.y + 90, 'button')
            .setScale(0.4)
            .setInteractive()
            .on('clicked', function () { console.log('caca'); }, this);

        var btn_exit = this.add.image(bg_pos.x, bg_pos.y + 180, 'button')
            .setScale(0.4);
        btn_exit.setInteractive();
        btn_exit.on('clicked', function () { console.log('caca'); }, this);

        WebFont.load({
            custom: {
                families: ['LuckiestGuy', 'HammersmithOne']
            },
            active: function () {
                add.text(bg_pos.x, bg_pos.y - 160, 'GANASTE !', { fontFamily: 'LuckiestGuy', fontSize: 70, color: '#ff0000' })
                    .setShadow(2, 2, "#333333", 2, false, true)
                    .setStroke('#ffffff', 16)
                    .setOrigin(0.5);

                add.text(bg_pos.x, bg_pos.y, 'Jugar de nuevo', { fontFamily: 'HammersmithOne', fontSize: 20, color: '#ffffff' })
                    .setShadow(2, 2, "#333333", 2, false, true)
                    .setOrigin(0.5);

                add.text(bg_pos.x, bg_pos.y + 90, 'Cambiar escena', { fontFamily: 'HammersmithOne', fontSize: 20, color: '#ffffff' })
                    .setShadow(2, 2, "#333333", 2, false, true)
                    .setOrigin(0.5);

                add.text(bg_pos.x, bg_pos.y + 180, 'Salir', { fontFamily: 'HammersmithOne', fontSize: 20, color: '#ffffff' })
                    .setShadow(2, 2, "#333333", 2, false, true)
                    .setOrigin(0.5);
            }
        });

        /*
        this.input.on('pointerup', function () {
            // this.scene.start('');
            var mainScene = this.scene.get('gamingPage');
            mainScene.reset_scope();

            this.scene.transition({ target: 'gamingPage', duration: 500 });
        }, this);
        */

    }

    play_again() {
        console.log('playing again!!!');
        //var mainScene = this.scene.get('gamingPage');
        //mainScene.reset_scope();
        //this.scene.transition({ target: 'gamingPage', duration: 500 });
    }
}