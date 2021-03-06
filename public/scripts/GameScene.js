class GameScene extends Phaser.Scene {
    constructor() {
        super('gamingPage');

        this.alertBgGroup;
        this.settingsGroup;
        this.bg_items = '';
        this.bg_image;
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
        this.total_objects = 0;
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
        var that = this;
        this.socket = io.connect(url, { query: { 'player': 'requesting' } });

        this.socket.emit('request.game', {
            gameId: 'retro'
        });

        this.socket.on('get.game', function (data) {
            console.log('game data retrieved!!!');
            console.log(data);
            console.log(data.gameData);
            console.log(data.gameData.bgMusic);
            console.log(data.gameData.bgImg);
            // console.log('assets/bg/' + data.gameData.bgImg);
            // console.log(`trying to load ${data.gameData.bgMusic}`);

            that.load.image('background', 'assets/bg/' + data.gameData.bgImg);

            that.load.audio('bg_music', [`assets/audio/${data.gameData.bgMusic}`]);
            // loading objects
            for (var objectImage in data.gameData.objects) {
                hidden_objects[objectImage] = {
                    id: objectImage,
                    name: data.gameData.objects[objectImage],
                    found: false
                }
                console.log(`${objectImage} loaded!`);
                that.load.image(objectImage, `assets/objects/${objectImage}.png`);
            }

            that.hidden_objects = hidden_objects;
            that.total_objects = Object.keys(hidden_objects).length;

            that.load.once('complete', () => {
                // texture loaded so use instead of the placeholder
                // card.setTexture(cardName)
                console.log('audio and crap loaded!!');
                // loading background image
                that.bg_image.setTexture('background');

                // loading background music
                that.sndBackground = that.sound.add('bg_music', { volume: 0.7 });
                that.sndBackground.loop = true;
                that.sndBackground.play();

                // adding objects to find
                for (var ho in hidden_objects) {
                    var x = Phaser.Math.Between(10, GAME_WIDTH - 100);
                    var y = Phaser.Math.Between(10, WIN_HEIGHT - 100);
                    var one_object = that.add.image(x, y, ho);

                    one_object.name = ho;
                    one_object.setInteractive();
                    one_object.on('clicked', clickHandler, that);
                }
                that.renderGameObjects();
            });
            that.load.start();
        });

        // images
        // this.load.image('background', 'assets/bg/kawaii.png'); // oto??o
        // this.load.image('background', 'assets/bg/classroom.png'); // salon de clases
        // this.load.image('background', 'assets/bg/treasure.png'); // tesoros
        // this.load.image('background', 'assets/bg/chalkboard.png'); // chalkboard
        // this.load.image('background', 'assets/bg/city.png'); // ciudad
        // this.load.image('background', 'assets/bg/retro.png'); // retro
        this.load.image('wrong', 'assets/red-cross-icon-png.png');
        this.load.image('cursor', 'assets/cursor.png');
        // for (var one in hidden_objects) {
        //     this.load.image(hidden_objects[one].id, `assets/objects/${hidden_objects[one].id}.png`);
        // }
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
        this.load.audio('bg_music', ['assets/audio/whitenoise.wav']);
    };

    create() {
        this.cameras.main.fadeIn(200, 0, 0, 0);

        this.graphics = this.add.graphics({ lineStyle: { width: 10, color: 0xff0000 } });
        wrongChoices = this.add.group();
        this.alertBgGroup = this.add.group();
        this.settingsGroup = this.add.group();
        this.wrongEvents = [];
        this.input.setDefaultCursor('pointer');

        var self = this;
        this.bg_image = this.add.image(500, 400, 'background');
        this.bg_image.setInteractive();
        this.bg_image.on('clicked', this.bg_click_listener, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        // adding objects to find
        // for (var ho in hidden_objects) {
        //     var x = Phaser.Math.Between(10, GAME_WIDTH - 100);
        //     var y = Phaser.Math.Between(10, WIN_HEIGHT - 100);
        //     var one_object = this.add.image(x, y, ho);

        //     one_object.name = ho;
        //     one_object.setInteractive();
        //     one_object.on('clicked', clickHandler, this);
        // }

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
        const settingsBtn = this.add.graphics()
            .fillStyle(0x000000, 0.8)
            .fillRoundedRect((WIN_WIDTH / 2) - 200, -20, 200, 50, 15);

        settingsBtn.setInteractive(new Phaser.Geom.Rectangle((WIN_WIDTH / 2) - 200, -20, 200, 50), Phaser.Geom.Rectangle.Contains);
        settingsBtn.on('pointerup', this.openSettings, this);

        //
        // Labels
        //

        this.blueScoreText = this.add.text(16, 18, '0 found', { fontSize: '32px', fill: FIRST_PLAYER.color });
        this.blueScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        this.redScoreText = this.add.text(1025, 18, '0 found', { fontSize: '32px', fill: SECOND_PLAYER.color });
        this.redScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        this.add.text((WIN_WIDTH / 2) - 100, 13, 'opciones', { fontSize: '15px', fill: '#ffffff' })
            .setOrigin(0.5);

        var line = 0;
        this.text_groups = this.physics.add.staticGroup();
        /*
        for (var i in hidden_objects) {
            var the_text = this.add.text(1220, (50 * line++) + 30, hidden_objects[i].name, { fontSize: getFontSize(hidden_objects[i].name), fill: '#FFFFFF' });
            the_text.name = i;
            this.text_groups.add(the_text);
        }
        */

        this.gameIdLabel = this.add.text(WIN_WIDTH - 100, 10, this.gameId, { fontSize: '10px', fill: '#bbbbbb' });

        this.cooldownBg = this.add.rectangle(GAME_WIDTH / 2, WIN_HEIGHT / 2, GAME_WIDTH, WIN_HEIGHT, 0x000000, 0.8);
        this.renderCooldownPhase();
        this.cooldownText = this.add.text(GAME_WIDTH / 2, (WIN_HEIGHT / 2) - 30, 'Demasiado rapido!!', { fontSize: '35px', fill: '#66525b' })
            .setOrigin(0.5).setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 0);
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
        });

        this.sndWrongChoice = this.sound.add('wrongChoice');
        this.sndCorrectChoice = this.sound.add('correctChoice');
        this.sndYouWon = this.sound.add('youWon');
        this.sndYouLoose = this.sound.add('youLoose');
        // this.sndBackground = this.sound.add('bg_music', { volume: 0.7 });
        // this.sndBackground.loop = true;
        // this.sndBackground.play();
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

    renderGameObjects() {
        var line = 0;
        for (var i in this.hidden_objects) {
            var the_text = this.add.text(1220, (50 * line++) + 30, hidden_objects[i].name, { fontSize: getFontSize(hidden_objects[i].name), fill: '#FFFFFF' });
            the_text.name = i;
            this.text_groups.add(the_text);
        }
    }

    renderGameId(gameId) {
        this.gameIdLabel.setText(gameId);
    }

    renderCooldownPhase() {
        const boxShadow = this.add.graphics();
        boxShadow.fillStyle(0xbbbbbb, 0.5);
        boxShadow.fillRoundedRect((GAME_WIDTH / 2) - 245, (WIN_HEIGHT / 2) - 95, 515, 215, 35);
        this.alertBgGroup.add(boxShadow);

        const whiteBorder = this.add.graphics();
        whiteBorder.fillStyle(0xdddddd, 1);
        whiteBorder.fillRoundedRect((GAME_WIDTH / 2) - 262, (WIN_HEIGHT / 2) - 112, 524, 224, 32);
        this.alertBgGroup.add(whiteBorder);

        const brownBorder = this.add.graphics();
        brownBorder.fillStyle(0x66525b, 1);
        brownBorder.fillRoundedRect((GAME_WIDTH / 2) - 256, (WIN_HEIGHT / 2) - 106, 512, 212, 28);
        this.alertBgGroup.add(brownBorder);

        const yellowBorder = this.add.graphics();
        yellowBorder.fillStyle(0xf4be1f, 1);
        yellowBorder.fillRoundedRect((GAME_WIDTH / 2) - 250, (WIN_HEIGHT / 2) - 98, 500, 198, 25);
        this.alertBgGroup.add(yellowBorder);

        const orangeBg = this.add.graphics();
        orangeBg.fillStyle(0xe57e04, 1);
        orangeBg.fillRoundedRect((GAME_WIDTH / 2) - 236, (WIN_HEIGHT / 2) - 80, 462, 162, 15);
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
                this.pickScene(that);
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
                var title = add.text(bg_pos.x + 10, bg_pos.y - 240, 'Configuraci??n', { fontFamily: 'LuckiestGuy', fontSize: 40, color: '#ffffff' })
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
        console.log('check winner!!');
        console.log(`${this.total_objects} vs ${this.total_found}`);

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
            });
        }
    }

    closeSettings() {
        //console.log(this.settingsGroup.children);
        this.settingsVisible = false;
        var justOneElm = this.settingsGroup.getMatching('name', 'bg_settings_panel');
        const textElements = this.settingsGroup.getMatching('type', 'Text');
        const buttonElements = this.settingsGroup.getMatching('name', 'someButton');
        console.log('what is left?');
        console.log(this.settingsGroup.getChildren());
        this.tweens.add({
            targets: this.settingsGroup.getChildren(),
            alpha: 0,
            duration: 500
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

    pickScene(dat) {
        this.cameras.main.fadeOut(700, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start('pickGame', { winner: true });
        });
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

    repositionTextElements() {
        const buttonElements = this.settingsGroup.getMatching('name', 'someButton');
        buttonElements.forEach(item => {
            console.log(item);
            item.x = -300;
        });
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
    };
// oto??o
var hidden_objects = {
    'robot': {
        id: 'robot',
        name: 'Robot',
        found: false
    }, 'bow': {
        id: 'bow',
        name: 'Mo??o',
        found: false
    }, 'cactus': {
        id: 'cactus',
        name: 'Cactus',
        found: false
    }, 'cloud': {
        id: 'cloud',
        name: 'Nube',
        found: false
    }, 'hamster': {
        id: 'hamster',
        name: 'Hamster',
        found: false
    }, 'ice_cream': {
        id: 'ice_cream',
        name: 'Cono de Nieve',
        found: false
    }, 'lollypop': {
        id: 'lollypop',
        name: 'Paleta',
        found: false
    }, 'owl': {
        id: 'owl',
        name: 'Buho',
        found: false
    }, 'panda': {
        id: 'panda',
        name: 'Panda',
        found: false
    }, 'unicorn_cake': {
        id: 'unicorn_cake',
        name: 'Pastel de Unicornio',
        found: false
    }, 'rice_bowl': {
        id: 'rice_bowl',
        name: 'Tazon de Arroz',
        found: false
    }
};

hidden_objects = {
    'mexico': {
        id: 'mexico',
        name: 'Mapa de Mexico',
        found: false
    }, 'ruler': {
        id: 'ruler',
        name: 'Regla',
        found: false
    }, 'calendar': {
        id: 'calendar',
        name: 'Calendario',
        found: false
    }, 'pencil': {
        id: 'pencil',
        name: 'Lapiz',
        found: false
    }, 'eraser': {
        id: 'eraser',
        name: 'Goma',
        found: false
    }, 'scissors': {
        id: 'scissors',
        name: 'Tijeras',
        found: false
    }, 'paper_clips': {
        id: 'paper_clips',
        name: 'Clips para papel',
        found: false
    }, 'diskette': {
        id: 'diskette',
        name: 'Disco flexible',
        found: false
    }, 'basket_ball': {
        id: 'basket_ball',
        name: 'Pelota de basquetball',
        found: false
    }
}

hidden_objects = {
    'crown': {
        id: 'crown',
        name: 'Corona',
        found: false
    }, 'ring': {
        id: 'ring',
        name: 'Anillo',
        found: false
    }, 'ruby': {
        id: 'ruby',
        name: 'Gema de Ruby',
        found: false
    }, 'gold_necklace': {
        id: 'gold_necklace',
        name: 'Collar de Oro',
        found: false
    }, 'pearls': {
        id: 'pearls',
        name: 'Collar de perlas',
        found: false
    }, 'bracelet': {
        id: 'bracelet',
        name: 'Bracalete',
        found: false
    }, 'blue_earrings': {
        id: 'blue_earrings',
        name: 'Aretes azules',
        found: false
    }, 'butterfly_brooch': {
        id: 'butterfly_brooch',
        name: 'Prendedor de Mariposa',
        found: false
    }, 'necklace': {
        id: 'necklace',
        name: 'Collar',
        found: false
    }
}

hidden_objects = {
    'cilinder': {
        id: 'cilinder',
        name: 'Cilindro',
        found: false
    }, 'cube': {
        id: 'cube',
        name: 'Cubo',
        found: false
    }, 'one': {
        id: 'one',
        name: 'Numero uno',
        found: false
    }, 'calculator': {
        id: 'calculator',
        name: 'Calculadora',
        found: false
    }, 'compass': {
        id: 'compass',
        name: 'Compas',
        found: false
    }, 'ruler_chalk': {
        id: 'ruler_chalk',
        name: 'Regla',
        found: false
    }, 'infinity': {
        id: 'infinity',
        name: 'Simbolo de Infinito',
        found: false
    }, 'phi': {
        id: 'phi',
        name: 'Simbolo de P??',
        found: false
    }, 'light_bulb': {
        id: 'light_bulb',
        name: 'Foco',
        found: false
    }, 'hexagon': {
        id: 'hexagon',
        name: 'Hexagono',
        found: false
    }, 'formula': {
        id: 'formula',
        name: 'Formula General',
        found: false
    }, 'pencil_chalk': {
        id: 'pencil_chalk',
        name: 'L??piz',
        found: false
    }, 'tictactoe': {
        id: 'tictactoe',
        name: 'Gato',
        found: false
    }
}

hidden_objects = {
    'flower': {
        id: 'flower',
        name: 'Flor',
        found: false
    }, 'lightpost': {
        id: 'lightpost',
        name: 'Poste de Luz',
        found: false
    }, 'butterfly': {
        id: 'butterfly',
        name: 'Mariposa',
        found: false
    }, 'cube_city': {
        id: 'cube_city',
        name: 'Cubo',
        found: false
    }, 'bottle': {
        id: 'bottle',
        name: 'Botella',
        found: false
    }, 'coin': {
        id: 'coin',
        name: 'Moneda',
        found: false
    }, 'bird': {
        id: 'bird',
        name: 'P??jaro',
        found: false
    }, 'bow_city': {
        id: 'bow_city',
        name: 'Mo??o de cabello',
        found: false
    }, 'flags': {
        id: 'flags',
        name: 'Banderin',
        found: false
    }
}

hidden_objects = {
    'tetris': {
        id: 'tetris',
        name: 'Piezas de tetris',
        found: false
    }, 'vhs': {
        id: 'vhs',
        name: 'Cassette de VHS',
        found: false
    }, 'roller_skates': {
        id: 'roller_skates',
        name: 'Patines',
        found: false
    }, '3d_lens': {
        id: '3d_lens',
        name: 'Lentes 3D',
        found: false
    }, 'nokia': {
        id: 'nokia',
        name: 'Celular',
        found: false
    }, 'cassette': {
        id: 'cassette',
        name: 'Cassette de M??sica',
        found: false
    }, 'guitar': {
        id: 'guitar',
        name: 'Guitarra',
        found: false
    }, 'envelope': {
        id: 'envelope',
        name: 'Sobre para carta',
        found: false
    }, 'vinyl': {
        id: 'vinyl',
        name: 'Disco de vinil',
        found: false
    }, 'mouse': {
        id: 'mouse',
        name: 'Mouse de computadora',
        found: false
    }, 'tennis': {
        id: 'tennis',
        name: 'Tenis',
        found: false
    }, 'polaroid': {
        id: 'polaroid',
        name: 'Camara de Instantaneas',
        found: false
    }, 'discman': {
        id: 'discman',
        name: 'Disc-Man',
        found: false
    }
}

hidden_objects = {};

function clickHandler(the_image, self) {
    console.log('click handler!!');
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
    var background_filling = that.add.graphics()
        .fillStyle(0x707070, 1)
        .setAlpha(0)
        .fillRoundedRect((GAME_WIDTH / 2) - 150, (WIN_HEIGHT / 2) - 125, 80, 30, 15);

    that.settingsGroup.add(background_filling);

    var theCircle = that.add.circle((GAME_WIDTH / 2) - 90, (WIN_HEIGHT / 2) - 110, 20, 0xffffff)
        .setStrokeStyle(10, 0x32a860)
        .setAlpha(0)
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

    that.settingsGroup.add(theCircle);
}