class GameScene extends Phaser.Scene {
    constructor() {
        super('gamingPage');

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
        this.cooldownBg;
        this.wrongEvents = [];
        this.total_objects = Object.keys(hidden_objects).length;
        this.total_found = 0;
    }

    preload() {
        this.load.image('background', 'assets/bg/kawaii.png');
        this.load.image('wrong', 'assets/red-cross-icon-png.png');
        this.load.image('cursor', 'assets/cursor.png');
        for (var one in hidden_objects) {
            this.load.image(hidden_objects[one].id, `assets/${hidden_objects[one].id}.png`);
        }
        this.load.image('text_bg', 'assets/bg/bg.png');
    };

    create() {
        this.graphics = this.add.graphics({ lineStyle: { width: 10, color: 0xff0000 } });
        wrongChoices = this.add.group();
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

        // Words background
        this.bg_items = this.add.rectangle(1300, 400, 200, 800, 0x000000, 0.8);

        // background players
        this.left_player_bg = this.add.rectangle(100, 35, 200, 50, 0x000000, 0.9);
        this.right_player_bg = this.add.rectangle(1100, 35, 200, 50, 0x000000, 0.9);
        // this.left_player_bg = this.add.rectangle(GAME_WIDTH / 2, 35, 200, 50, 0x000000, 0.9);

        this.blueScoreText = this.add.text(16, 18, '0 found', { fontSize: '32px', fill: FIRST_PLAYER.color });
        this.blueScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        this.redScoreText = this.add.text(1025, 18, '0 found', { fontSize: '32px', fill: SECOND_PLAYER.color });
        this.redScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        // this.gameIdLabel.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        var line = 0;
        this.text_groups = this.physics.add.staticGroup();
        for (var i in hidden_objects) {
            var the_text = this.add.text(1220, (50 * line++) + 30, hidden_objects[i].name, { fontSize: getFontSize(hidden_objects[i].name), fill: '#FFFFFF' });
            the_text.name = i;
            this.text_groups.add(the_text);
            //the_text.alpha = 0.8;
            //the_text.setFill('#FF0000');
        }

        this.gameIdLabel = this.add.text(WIN_WIDTH - 100, 10, this.gameId, { fontSize: '10px', fill: '#bbbbbb' });

        this.cooldownBg = this.add.rectangle(GAME_WIDTH / 2, WIN_HEIGHT / 2, GAME_WIDTH, WIN_HEIGHT, 0x000000, 0.8);
        this.cooldownText = this.add.text(GAME_WIDTH / 3, WIN_HEIGHT / 2, 'You are clicking too fast, please wait', { fontSize: '40px', fill: '#FF0000' });

        this.renderOponent('waiting');
        this.renderGameId('...loading');

        socket.on("game.begin", function (data) {
            console.log('what game am I in and what player am I?');
            console.log(data);
            self.gameId = data.gameId;
            self.playerTag = data.player;

            self.renderGameId(data.gameId);
            self.renderOponent('0 found');
        });

        socket.on('remove.item', function (data) {
            console.log('need to remove this item from the list:', data.item);
            console.log('and add a point to my oponent');
            self.oponentHitHandler(data.item);
        })
    };

    update() {
        var self = this;
        /*
        var the_graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xff0000, alpha: 0.7 } });
        var line = new Phaser.Geom.Line(1210, 45, 1390, 45);
        */
        /*
        for (var i in hidden_objects) {
            if (hidden_objects[i].found) {
                the_graphics.strokeLineShape(line);
            }
            line.y1 += 50;
            line.y2 += 50;
        }
        */
        // console.log(`[${game.input.mousePointer.x},${game.input.mousePointer.y}]`);
        toggleVisibilityBackgrounds(self);

        if (this.cooldown) {
            this.cooldownText.setVisible(true).setDepth(1);
            this.cooldownBg.setVisible(true).setDepth(1);
        } else {
            this.cooldownText.setVisible(false);
            this.cooldownBg.setVisible(false);
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
            this.cooldownText.setVisible(true).setDepth(1);
            this.cooldownBg.setVisible(true).setDepth(1);
            this.input.setDefaultCursor('not-allowed');
            // TODO: do something like below here
        } else { // wait until no more cursors are visible... which might be up to 3 sec, meaning the last one that was activated
            // pretty sure this will help with the stuttering
            this.cooldownText.setVisible(false);
            this.cooldownBg.setVisible(false);
            this.input.setDefaultCursor('pointer');
        }

        this.cooldown = howManyAreActive > 3;
        //console.log('this cooldown', this.cooldown);
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

    reset_scope() {
        this.total_found = 0;
        scores = {
            'blue': 0,
            'red': 0
        };
    }

    show_object_found(pointerCoord, text, color) {
        console.log(arguments);
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
        if (this.cooldown) {
            return;
        }
        var mynewcross = this.add.image(game.input.mousePointer.x, game.input.mousePointer.y, 'wrong');
        wrongChoices.add(mynewcross);

        console.log('how many do we have?', wrongChoices.getLength());
        console.log(wrongChoices.getChildren());
        console.log(wrongChoices.getFirst(true));

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
        this.show_object_found({ x: theObject.x, y: theObject.y }, '+1', SECOND_PLAYER.color);

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
            console.log(`blue ${this.redScoreText} vs red ${this.blueScoreText}`);
            var theWinner = '';
            console.log(`${scores.blue} vs ${scores.red}`);

            if (scores.red == scores.blue) {
                theWinner = 'tie';
            } else if (scores.red > scores.blue) {
                theWinner = 'oponent';
            } else {
                theWinner = 'self';
            }

            this.scene.start('donePage', { winner: theWinner });
        }
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

function clickHandler(the_image, self) {
    if (this.cooldown) {
        return;
    }

    the_image.off('clicked', this.clickHandler);
    the_image.input.enabled = false;

    if (the_image.name in hidden_objects) {
        hidden_objects[the_image.name].found = true;
        scores.blue += 1;
        this.total_found += 1;
        this.blueScoreText.setText(`${scores.blue} found`);
        this.show_object_found({ x: game.input.mousePointer.x - 40, y: game.input.mousePointer.y - 20 }, '+1', FIRST_PLAYER.color);
        socket.emit('select.item', {
            gameId: socket.id,
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