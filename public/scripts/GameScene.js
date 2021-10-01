class GameScene extends Phaser.Scene {
    constructor() {
        super('gamingPage');

        this.alertBgGroup;
        this.settingsGroup;
        this.bg_items = '';
        this.left_player_bg;
        this.right_player_bg;
        this.gameId = '...loading';
        this.playerTag = '';
        this.gameIdLabel = '';
        this.the_backgrounds;
        this.text_groups;
        this.cooldown = false;
        this.cooldownText;
        this.cooldownText2;
        this.cooldownBg;
        this.wrongEvents = [];
        this.total_objects = Object.keys(hidden_objects).length;
        this.total_found = 0;
        this.socket;
        this.backgroundMusicPlaying = true;

        this.settingsVisible = false;

        this.sndWrongChoice = '';
        this.sndCorrectChoice;
        this.sndYouWon;
        this.sndYouLoose;
        this.sndBackground;

        this.bg_pos = {
            x: GAME_WIDTH / 2,
            y: (WIN_HEIGHT / 2)
        };
    }

    init(data) {
        var element = document.createElement('style');
        document.head.appendChild(element);
        var sheet = element.sheet;
        var styles = '@font-face { font-family: "LuckiestGuy"; src: url("assets/fonts/LuckiestGuy-Regular.ttf") format("opentype"); }\n';
        sheet.insertRule(styles, 0);
        styles = '@font-face { font-family: "HammersmithOne"; src: url("assets/fonts/HammersmithOne-Regular.ttf") format("opentype"); }\n';
        sheet.insertRule(styles, 0);
    }

    preload() {
        // images
        this.load.image('background', 'assets/bg/kawaii.png');
        this.load.image('wrong', 'assets/red-cross-icon-png.png');
        this.load.image('cursor', 'assets/cursor.png');
        for (var one in hidden_objects) {
            this.load.image(hidden_objects[one].id, `assets/${hidden_objects[one].id}.png`);
        }
        this.load.image('text_bg', 'assets/bg/bg.png');
        this.load.image('panel', 'assets/bg_panel_blue.png');
        this.load.image('button', 'assets/button_blue.png');
        this.load.image('bg_settings', 'assets/bg_stripes.png');
        this.load.image('close_cross', 'assets/cancel_blue.png');

        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');

        // audios
        this.load.audio('wrongChoice', ['assets/audio/wrong_choice.wav']);
        this.load.audio('correctChoice', ['assets/audio/correct_choice.wav']);
        this.load.audio('youWon', ['assets/audio/game_over.wav']);
        this.load.audio('youLoose', ['assets/audio/sad_trombone.wav']);
        this.load.audio('bg_music', ['assets/audio/steady_rain.wav']);
    };

    create() {
        this.cameras.main.fadeIn(200, 0, 0, 0);

        this.socket = io.connect(url, { query: { 'player': 'requesting' } });

        this.graphics = this.add.graphics({ lineStyle: { width: 10, color: 0xff0000 } });
        wrongChoices = this.add.group();
        this.alertBgGroup = this.add.group();
        this.settingsGroup = this.add.group();
        this.wrongEvents = [];
        this.input.setDefaultCursor('pointer');

        var self = this;
        var bg_image = this.add.image(500, 400, 'background');
        bg_image.setInteractive();
        bg_image.on('clicked', this.bg_click_listener, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        // adding objects to find
        for (var ho in hidden_objects) {
            var x = Phaser.Math.Between(10, GAME_WIDTH - 100);
            var y = Phaser.Math.Between(10, WIN_HEIGHT - 100);
            var one_object = this.add.image(x, y, ho);

            one_object.name = ho;
            one_object.setInteractive();
            one_object.on('clicked', clickHandler, this);
        }

        this.input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);


        // 
        // Backgrounds
        // 

        // Words background
        this.bg_items = this.add.rectangle(1300, 400, 200, 800, 0x000000, 0.8);

        // background players
        this.left_player_bg = this.add.rectangle(100, 35, 200, 50, 0x000000, 0.9);
        this.right_player_bg = this.add.rectangle(1100, 35, 200, 50, 0x000000, 0.9);
        // this.left_player_bg = this.add.rectangle(GAME_WIDTH / 2, 35, 200, 50, 0x000000, 0.9);
        const settingsBtn = this.add.rectangle((WIN_WIDTH / 2) - 100, 0, 200, 50, 0x000000, 0.8);

        settingsBtn.setInteractive();
        settingsBtn.on('clicked', this.openSettings, this);

        //
        // Labels
        //

        this.blueScoreText = this.add.text(16, 18, '0 found', { fontSize: '32px', fill: FIRST_PLAYER.color });
        this.blueScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        this.redScoreText = this.add.text(1025, 18, '0 found', { fontSize: '32px', fill: SECOND_PLAYER.color });
        this.redScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        this.add.text((WIN_WIDTH / 2) - 100, 13, 'configuración', { fontSize: '15px', fill: '#ffffff' })
            .setOrigin(0.5);

        var line = 0;
        this.text_groups = this.physics.add.staticGroup();
        for (var i in hidden_objects) {
            var the_text = this.add.text(1220, (50 * line++) + 30, hidden_objects[i].name, { fontSize: getFontSize(hidden_objects[i].name), fill: '#FFFFFF' });
            the_text.name = i;
            this.text_groups.add(the_text);
        }

        this.gameIdLabel = this.add.text(WIN_WIDTH - 100, 10, this.gameId, { fontSize: '10px', fill: '#bbbbbb' });

        this.cooldownBg = this.add.rectangle(GAME_WIDTH / 2, WIN_HEIGHT / 2, GAME_WIDTH, WIN_HEIGHT, 0x000000, 0.8);
        this.renderAlertBg();
        this.cooldownText = this.add.text(GAME_WIDTH / 2, (WIN_HEIGHT / 2) - 30, 'Demasiado rapido!!', { fontSize: '35px', fill: '#59f5fb' })
            .setOrigin(0.5).setShadow(5, 5, 'rgba(128, 128, 128, 0.5)', 0);
        this.cooldownText2 = this.add.text(GAME_WIDTH / 2, (WIN_HEIGHT / 2) + 30, 'Espera por favor', { fontSize: '25px', fill: '#ffffff' })
            .setOrigin(0.5).setShadow(5, 5, 'rgba(128, 128, 128, 0.5)', 0);

        this.renderOponent('waiting');
        this.renderGameId('...loading');

        this.createSettingsPanel();

        // this.settingsGroup.setVisible(false);

        this.socket.on("game.begin", function (data) {
            console.log('what game am I in and what player am I?');
            console.log(data);
            self.gameId = data.gameId;
            self.playerTag = data.player;

            self.renderGameId(data.gameId);
            self.renderOponent('0 found');
        });

        this.socket.on('remove.item', function (data) {
            console.log('need to remove this item from the list:', data.item);
            console.log('and add a point to my oponent');
            self.oponentHitHandler(data.item);
        })

        this.sndWrongChoice = this.sound.add('wrongChoice');
        this.sndCorrectChoice = this.sound.add('correctChoice');
        this.sndYouWon = this.sound.add('youWon');
        this.sndYouLoose = this.sound.add('youLoose');
        this.sndBackground = this.sound.add('bg_music', { volume: 0.7 });
        this.sndBackground.loop = true;
        this.sndBackground.play();
    };

    update() {
        var self = this;
        toggleVisibilityBackgrounds(self);

        if (this.cooldown) {
            this.alertBgGroup.setVisible(true).setDepth(1);
            this.cooldownText.setVisible(true).setDepth(1);
            this.cooldownText2.setVisible(true).setDepth(1);
            this.cooldownBg.setVisible(true).setDepth(1);
            this.input.setDefaultCursor('not-allowed');
        } else {
            this.alertBgGroup.setVisible(false);
            this.cooldownText.setVisible(false);
            this.cooldownText2.setVisible(false);
            this.cooldownBg.setVisible(false);
            this.input.setDefaultCursor('pointer');
        }

        var howManyAreActive = 0;
        for (var i = 0; i < this.wrongEvents.length; i++) {
            if (this.wrongEvents[i].hasDispatched) {
                this.wrongEvents[i].remove(false);
            } else {
                howManyAreActive++;
            }
        }

        if (howManyAreActive > 3) {
            this.cooldown = true;
        }

        if (this.cooldown && howManyAreActive == 0) {
            this.cooldown = false;
        }
    };

    renderOponent(label) {
        this.redScoreText.setText(label);
        if (label == 'waiting') {
            this.redScoreText.setFill('#666666');
        } else {
            this.redScoreText.setFill(SECOND_PLAYER.color);
        }
    }

    renderGameId(gameId) {
        this.gameIdLabel.setText(gameId);
    }

    renderAlertBg() {
        var boxShadow = this.add.graphics();
        boxShadow.fillStyle(0xbbbbbb, 0.5);
        boxShadow.fillRoundedRect((GAME_WIDTH / 2) - 245, (WIN_HEIGHT / 2) - 95, 515, 215, 35);
        this.alertBgGroup.add(boxShadow);

        var whiteBorder = this.add.graphics();
        whiteBorder.fillStyle(0xdddddd, 1);
        whiteBorder.fillRoundedRect((GAME_WIDTH / 2) - 262, (WIN_HEIGHT / 2) - 112, 524, 224, 32);
        this.alertBgGroup.add(whiteBorder);

        var brownBorder = this.add.graphics();
        brownBorder.fillStyle(0x66525b, 1);
        brownBorder.fillRoundedRect((GAME_WIDTH / 2) - 256, (WIN_HEIGHT / 2) - 106, 512, 212, 32);
        this.alertBgGroup.add(brownBorder);

        var orangeBg = this.add.graphics();
        orangeBg.fillStyle(0xe57e04, 1);
        orangeBg.fillRoundedRect((GAME_WIDTH / 2) - 240, (WIN_HEIGHT / 2) - 90, 480, 180, 25);
        this.alertBgGroup.add(orangeBg);
    }

    createSettingsPanel() {
        var bg_pos = {
            x: GAME_WIDTH / 2,
            y: (WIN_HEIGHT / 2)
        };
        var add = this.add,
            that = this;

        //var bg_image = add.image(0, 0, 'bg_settings');
        var bg_image = add.tileSprite(WIN_WIDTH / 2, WIN_HEIGHT / 2, WIN_WIDTH + 210, WIN_HEIGHT + 210, 'bg_settings')
            .setAlpha(0);
        this.tweens.add({
            targets: bg_image,
            x: (WIN_WIDTH / 2) + 100,
            y: (WIN_HEIGHT / 2) + 100,
            duration: 2500,
            loop: -1
        });
        this.settingsGroup.add(bg_image);
        //bg_image.setOrigin(0, 0);

        var bg_img = add.image(bg_pos.x, -500, 'panel');
        bg_img.name = 'bg_settings_panel';
        this.settingsGroup.add(bg_img);

        var close_img = add.image(bg_pos.x + 250, bg_pos.y - 260, 'close_cross')
            .setAlpha(0);
        close_img.setInteractive();
        close_img.on('clicked', function () {
            this.closeSettings();
        }, this);
        close_img.on('pointerover', function (event) {
            this.setTint(0xffbbbb);
        });
        close_img.on('pointerout', function (event) {
            this.clearTint();
        });

        this.settingsGroup.add(close_img);

        var btn_change_scene = add.image(-300, bg_pos.y + 20, 'button')
            .setScale(0.4)
            .setName('someButton')
            .setInteractive()
            .on('clicked', function () {
                this.closeSettings();
            }, this)
            .on('pointerover', function (event) {
                this.setTint(0x2ba1b6);
            })
            .on('pointerout', function (event) {
                this.clearTint();
            });

        this.settingsGroup.add(btn_change_scene);

        var btn_new_game = this.add.image(-300, bg_pos.y + 100, 'button')
            .setScale(0.4)
            .setName('someButton')
            .setInteractive()
            .on('clicked', function () {
                this.closeSettings();
            }, this)
            .on('pointerover', function (event) {
                this.setTint(0x2ba1b6);
            })
            .on('pointerout', function (event) {
                this.clearTint();
            });

        this.settingsGroup.add(btn_new_game);

        var btn_close_settings = this.add.image(-300, bg_pos.y + 180, 'button')
            .setScale(0.4)
            .setName('someButton')
            .setInteractive()
            .on('clicked', function () {
                this.closeSettings();
            }, this)
            .on('pointerover', function (event) {
                this.setTint(0x2ba1b6);
            })
            .on('pointerout', function (event) {
                this.clearTint();
            });

        this.settingsGroup.add(btn_close_settings);

        // adding the slider
        renderToggle(function () {
            if (that.backgroundMusicPlaying) {
                that.sndBackground.play();
            } else {
                that.sndBackground.stop();
            }
        }, this);

        WebFont.load({
            custom: {
                families: ['LuckiestGuy', 'HammersmithOne']
            },
            active: function () {
                const settingsGroup = game.scene.getScene('gamingPage').settingsGroup;
                var title = add.text(bg_pos.x + 10, bg_pos.y - 240, 'Configuración', { fontFamily: 'LuckiestGuy', fontSize: 40, color: '#ffffff' })
                    .setShadow(5, 5, "#333333", 2, false, true)
                    .setOrigin(0.5)
                    .setScale(0.1)
                    .setAlpha(0);

                settingsGroup.add(title);

                var t1 = add.text(bg_pos.x, bg_pos.y + 20, 'Cambiar Escena', { fontFamily: 'HammersmithOne', fontSize: 20, color: '#ffffff' })
                    .setShadow(2, 2, "#333333", 2, false, true)
                    .setOrigin(0.5)
                    .setScale(0.1)
                    .setAlpha(0);

                settingsGroup.add(t1);

                var t2 = add.text(bg_pos.x, bg_pos.y + 100, 'Juego Nuevo', { fontFamily: 'HammersmithOne', fontSize: 20, color: '#ffffff' })
                    .setShadow(2, 2, "#333333", 2, false, true)
                    .setOrigin(0.5)
                    .setScale(0.1)
                    .setAlpha(0);

                settingsGroup.add(t2);

                var t3 = add.text(bg_pos.x, bg_pos.y + 180, 'Salir', { fontFamily: 'HammersmithOne', fontSize: 20, color: '#ffffff' })
                    .setShadow(2, 2, "#333333", 2, false, true)
                    .setOrigin(0.5)
                    .setScale(0.1)
                    .setAlpha(0);

                settingsGroup.add(t3);

                var toggle_background_sound = add.text(bg_pos.x - 50, bg_pos.y - 120, 'Sonido de fondo', { fontFamily: 'HammersmithOne', fontSize: 20, color: '#ffffff' })
                    .setShadow(2, 2, "#333333", 2, false, true)
                    .setScale(0.1)
                    .setAlpha(0);

                settingsGroup.add(toggle_background_sound);

                // that.settingsGroup.add(toggle_background_sound);
                /*
                self.tweens.add({
                    targets: [t1, t2, t3, t4],
                    props: {
                        x: { value: bg_pos.x, duration: 800 }
                    }
                });
                */
            }
        });
    }

    reset_scope() {
        this.total_found = 0;
        scores = {
            'blue': 0,
            'red': 0
        };
    }

    showObjectFound(pointerCoord, text, color) {
        var text = this.add.text(pointerCoord.x, pointerCoord.y, text, { fontSize: '40px', fill: color });
        text.setShadow(5, 5, 'rgba(0,0,0,1)', 0);

        this.tweens.add({
            targets: text,
            y: pointerCoord.y - 100,
            duration: 750
        });

        this.tweens.add({
            targets: text,
            alpha: 0,
            delay: 350,
            duration: 100
        });
    }

    bg_click_listener() {
        if (this.cooldown || this.settingsVisible) {
            return;
        }
        var mynewcross = this.add.image(game.input.mousePointer.x, game.input.mousePointer.y, 'wrong');
        wrongChoices.add(mynewcross);
        this.sndWrongChoice.play();

        var evt = this.time.addEvent({
            delay: 3000, callback: function (self) {
                // box.setVisible(false);

                this.tweens.add({
                    targets: mynewcross,
                    alpha: 0,
                    duration: 200
                });

            }, callbackScope: this
        });

        this.wrongEvents.push(evt);
    }

    oponentHitHandler(imageName) {
        hidden_objects[imageName].found = true;
        scores.red += 1;
        this.total_found += 1;

        var theObject = this.children.getByName(imageName);
        this.redScoreText.setText(`${scores.red} found`);
        this.showObjectFound({ x: theObject.x, y: theObject.y }, '+1', SECOND_PLAYER.color);

        this.tweens.add({
            targets: theObject,
            alpha: 0,
            duration: 400,
            ease: 'Sinusoidal'
        }, this);

        var textFound = this.text_groups.getMatching('name', imageName);
        if (textFound.length == 1) {
            textFound[0].setAlpha(0.7);
            textFound[0].setFill(SECOND_PLAYER.color);
        }

        this.checkWiner(this);

    }

    checkWiner(self) {
        if (this.total_objects == this.total_found) {

            var theWinner = '';

            if (scores.red == scores.blue) {
                theWinner = 'tie';
            } else if (scores.red > scores.blue) {
                this.sndYouLoose.play();
                theWinner = 'oponent';
            } else {
                this.sndYouWon.play();
                theWinner = 'self';
            }

            this.tweens.add({
                targets: this.sndBackground,
                volume: 0,
                duration: 500
            });

            this.socket.disconnect();
            this.cameras.main.fadeOut(700, 0, 0, 0);

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.scene.start('donePage', { winner: theWinner });
            })
        }
    }

    closeSettings() {
        console.log(' - testing - ');
        //console.log(this.settingsGroup.children);
        this.settingsVisible = false;
        var justOneElm = this.settingsGroup.getMatching('name', 'bg_settings_panel');
        const textElements = this.settingsGroup.getMatching('type', 'Text');
        const buttonElements = this.settingsGroup.getMatching('name', 'someButton');
        this.tweens.add({
            targets: this.settingsGroup.getChildren(),
            alpha: 0,
            duration: 500,
            onComplete: this.makeItShowAgainAndSetVisibleAsFalse.bind(this)
        }, this);

        this.tweens.add({
            targets: justOneElm,
            y: -500,
            duration: 500,
        }, this);

        this.tweens.add({
            targets: textElements,
            props: {
                alpha: { value: 0, duration: 500 },
                scale: { value: 0, duration: 500 }
            },
        }, this);

        this.tweens.add({
            targets: buttonElements,
            props: {
                x: { value: GAME_WIDTH + 300, duration: 500 }
            },
            onComplete: this.repositionTextElements.bind(this)
        }, this);

    }

    openSettings() {
        this.settingsVisible = true;
        var justOneElm = this.settingsGroup.getMatching('name', 'bg_settings_panel');
        const textElements = this.settingsGroup.getMatching('type', 'Text');
        const buttonElements = this.settingsGroup.getMatching('name', 'someButton');
        console.log('the text elements are:');
        console.log(this.settingsGroup.getChildren());
        console.log(textElements);
        // console.log()

        this.tweens.add({
            targets: this.settingsGroup.getChildren(),
            alpha: 1,
            duration: 500
        }, this);

        this.tweens.add({
            targets: justOneElm,
            y: this.bg_pos.y,
            duration: 500
        }, this);

        this.tweens.add({
            targets: textElements,
            props: {
                alpha: { value: 1, duration: 800 },
                scale: { value: 1, duration: 700, ease: 'Bounce' }
            }
        }, this);

        this.tweens.add({
            targets: buttonElements,
            props: {
                x: { value: this.bg_pos.x, duration: 800, ease: 'Bounce' }
            }
        }, this);
    }

    makeItShowAgainAndSetVisibleAsFalse() {
        console.log('here is the magic!!');
    }

    repositionTextElements() {
        const buttonElements = this.settingsGroup.getMatching('name', 'someButton');
        buttonElements.forEach(item => {
            console.log(item);
            item.x = -300;
        });
        // buttonElements.setOrigin(300);
        console.log('caca 2');
    }
}

var the_objects,
    line,
    graphics,
    objects = [],
    wrongChoices,
    scores = {
        'blue': 0,
        'red': 0
    },
    hidden_objects = {
        'robot': {
            id: 'robot',
            name: 'Robot',
            found: false
        }, 'bow': {
            id: 'bow',
            name: 'Bow',
            found: false
        }, 'cactus': {
            id: 'cactus',
            name: 'Cactus',
            found: false
        }, 'cloud': {
            id: 'cloud',
            name: 'Cloud',
            found: false
        }, 'hamster': {
            id: 'hamster',
            name: 'Hamster',
            found: false
        }, 'ice_cream': {
            id: 'ice_cream',
            name: 'Ice Cream',
            found: false
        }, 'lollypop': {
            id: 'lollypop',
            name: 'Lolly-Pop',
            found: false
        }, 'owl': {
            id: 'owl',
            name: 'Owl',
            found: false
        }, 'panda': {
            id: 'panda',
            name: 'Panda',
            found: false
        }, 'unicorn_cake': {
            id: 'unicorn_cake',
            name: 'Unicorn Cake',
            found: false
        }, 'rice_bowl': {
            id: 'rice_bowl',
            name: 'Rice Bowl',
            found: false
        }
    };

hidden_objects = {
    'robot': {
        id: 'robot',
        name: 'Robot',
        found: false
    }, 'panda': {
        id: 'panda',
        name: 'Panda',
        found: false
    }
};

function clickHandler(the_image, self) {
    if (this.cooldown || this.settingsVisible) {
        return;
    }

    the_image.off('clicked', this.clickHandler);
    the_image.input.enabled = false;

    if (the_image.name in hidden_objects) {
        this.sndCorrectChoice.play();
        hidden_objects[the_image.name].found = true;
        scores.blue += 1;
        this.total_found += 1;
        this.blueScoreText.setText(`${scores.blue} found`);
        this.showObjectFound({ x: game.input.mousePointer.x - 40, y: game.input.mousePointer.y - 20 }, '+1', FIRST_PLAYER.color);
        this.socket.emit('select.item', {
            gameId: this.socket.id,
            player: this.playerTag,
            item: the_image.name
        });
    }

    this.tweens.add({
        targets: the_image,
        alpha: 0,
        duration: 400,
        ease: 'Sinusoidal'
    }, this);

    var textFound = this.text_groups.getMatching('name', the_image.name);
    if (textFound.length == 1) {
        textFound[0].setAlpha(0.7);
        textFound[0].setFill(FIRST_PLAYER.color);
    }

    this.checkWiner(this);
}

function updateScore(self) {
    this.scores.blue += 1;
}

function getFontSize(str) {
    const lenStr = str.length;
    if (lenStr > 11) {
        return '22px';
    }
    return '25px';
}

function toggleVisibilityBackgrounds(self) {
    if (game.input.mousePointer.x > 1200) {
        self.bg_items.alpha = 0.3;
    } else {
        self.bg_items.alpha = 1;
    }

    if (game.input.mousePointer.x > 0 && game.input.mousePointer.x < 210 && game.input.mousePointer.y > 0 && game.input.mousePointer.y < 70) {
        self.left_player_bg.alpha = 0.3;
    } else {
        self.left_player_bg.alpha = 0.9;
    }

    if (game.input.mousePointer.x > 910 && game.input.mousePointer.x < 1200 && game.input.mousePointer.y > 0 && game.input.mousePointer.y < 70) {
        self.right_player_bg.alpha = 0.3;
    } else {
        self.right_player_bg.alpha = 0.9;
    }
}

function renderToggle(callbackFn, that) {
    that.add.graphics()
        .fillStyle(0x707070, 1)
        .fillRoundedRect((GAME_WIDTH / 2) - 150, (WIN_HEIGHT / 2) - 125, 80, 30, 15);

    var theCircle = that.add.circle((GAME_WIDTH / 2) - 90, (WIN_HEIGHT / 2) - 110, 20, 0xffffff)
        .setStrokeStyle(10, 0x32a860)
        .setInteractive()
        .on('clicked', function () {
            if (that.backgroundMusicPlaying) {
                that.tweens.add({
                    targets: theCircle,
                    props: {
                        x: { value: (GAME_WIDTH / 2) - 130, duration: 200 }
                    }
                });
                theCircle.setStrokeStyle(10, 0x555555);
            } else {
                that.tweens.add({
                    targets: theCircle,
                    props: {
                        x: { value: (GAME_WIDTH / 2) - 90, duration: 200 }
                    }
                })
                theCircle.setStrokeStyle(10, 0x32a860);
            }

            that.backgroundMusicPlaying = !that.backgroundMusicPlaying;
            callbackFn();
        }, this);
}