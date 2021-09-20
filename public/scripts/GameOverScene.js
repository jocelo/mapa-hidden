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
        this.load.image('raybg', 'assets/ray_bg.png');
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);

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
            'oponent': 'You loose'
        };

        if (this.winner in winningMessages) {
            congratulate_msg = winningMessages[this.winner];
        }

        input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);

        var graphics = this.add.graphics();
        graphics.fillGradientStyle(0x666666, 0x666666, 0x202020, 0x202020, 1);
        graphics.fillRect(0, 0, WIN_WIDTH, WIN_HEIGHT);

        if (this.winner == 'self') {
            this.ray_bg = this.add.image(WIN_WIDTH / 2, WIN_HEIGHT / 2, 'raybg')
                .setScale(1.5)
                .setAlpha(0.7);
        }

        this.add.text(WIN_WIDTH / 2, WIN_HEIGHT * .3, congratulate_msg);
        var text2 = this.add.text(WIN_WIDTH / 2, WIN_HEIGHT * .4, congratulate_msg);
        text2.align = 'center';
        this.add.text(WIN_WIDTH / 2, WIN_HEIGHT * 0.6, 'Click to play again.');

        var bg = this.add.image(bg_pos.x, bg_pos.y, 'backgroundd');
        bg.setScale(0.5);

        // play again button
        this.add.image(bg_pos.x, bg_pos.y, 'button')
            .setScale(0.4)
            .setInteractive()
            .on('clicked', function () {
                this.playAgain();
            }, this)
            .on('pointerover', function (event) {
                this.setTint(0x2ba1b6);
            })
            .on('pointerout', function (event) {
                this.clearTint();
            });

        // choose another scene button
        add.image(bg_pos.x, bg_pos.y + 90, 'button')
            .setScale(0.4)
            .setInteractive()
            .on('clicked', function () {

            }, this)
            .on('pointerover', function (event) {
                this.setTint(0x2ba1b6);
            })
            .on('pointerout', function (event) {
                this.clearTint();
            });

        // close everything button
        this.add.image(bg_pos.x, bg_pos.y + 180, 'button')
            .setScale(0.4)
            .setInteractive()
            .on('clicked', function () {
                this.closeGame();
            }, this)
            .on('pointerover', function (event) {
                this.setTint(0x2ba1b6);
            })
            .on('pointerout', function (event) {
                this.clearTint();
            });

        WebFont.load({
            custom: {
                families: ['LuckiestGuy', 'HammersmithOne']
            },
            active: function () {
                add.text(bg_pos.x, bg_pos.y - 160, congratulate_msg, { fontFamily: 'LuckiestGuy', fontSize: 70, color: '#ff0000' })
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
    }

    update() {
        if (this.winner == 'self') {
            this.ray_bg.rotation += 0.005;
        }
    }

    playAgain() {
        this.cameras.main.fadeOut(700, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            var mainScene = this.scene.get('gamingPage');
            mainScene.reset_scope();
            this.scene.transition({ target: 'gamingPage', duration: 300 });
        });
    }

    closeGame() {
        window.location.href = "https://matematicasconpaula.com/";
    }
}