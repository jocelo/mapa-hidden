class GameScene extends Phaser.Scene {
    constructor() {
        super('gamingPage');

        this.bg_items = '';
        this.left_player_bg;
        this.right_player_bg;
        this.the_backgrounds;
        this.text_groups;
    }

    preload() {
        this.load.image('background', 'assets/bg/kawaii.png');
        this.load.image('cursor', 'assets/cursor.png');
        for (var one in hidden_objects) {
            this.load.image(hidden_objects[one].id, `assets/${hidden_objects[one].id}.png`);
        }
        this.load.image('text_bg', 'assets/bg/bg.png');
    };

    create() {
        this.graphics = this.add.graphics({ lineStyle: { width: 10, color: 0xff0000 } });

        var self = this;
        this.add.image(500, 400, 'background');

        this.cursors = this.input.keyboard.createCursorKeys();

        // adding objects to find
        for (var ho in hidden_objects) {
            var x = Phaser.Math.Between(10, GAME_WIDTH - 100);
            var y = Phaser.Math.Between(10, WIN_HEIGHT - 100);

            console.log(` [${ho}] = (${x},${y})`);

            var one_object = this.add.image(x, y, ho);
            one_object.name = ho;
            one_object.setInteractive();
            one_object.on('clicked', clickHandler, this);
        }

        this.input.on('gameobjectup', function (pointer, gameObject) {
            gameObject.emit('clicked', gameObject);
        }, this);

        addPlayer(self);

        // Words background
        this.bg_items = this.add.rectangle(1300, 400, 200, 800, 0x000000, 0.8);

        // background players
        this.left_player_bg = this.add.rectangle(100, 35, 200, 50, 0x000000, 0.9);
        this.right_player_bg = this.add.rectangle(1100, 35, 200, 50, 0x000000, 0.9);

        //this.the_backgrounds = this.physics.add.staticGroup();
        //this.the_backgrounds.create(200, 200, 'text_bg');
        //this.the_backgrounds.create(400, 400, 'text_bg');

        this.blueScoreText = this.add.text(16, 18, '0 found', { fontSize: '32px', fill: FIRST_PLAYER.color });
        this.blueScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        this.redScoreText = this.add.text(1025, 18, '0 found', { fontSize: '32px', fill: SECOND_PLAYER.color });
        this.redScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        var line = 0;
        this.text_groups = this.physics.add.staticGroup();
        for (var i in hidden_objects) {
            var the_text = this.add.text(1220, (50 * line++) + 30, hidden_objects[i].name, { fontSize: getFontSize(hidden_objects[i].name), fill: '#FFFFFF' });
            the_text.name = i;
            this.text_groups.add(the_text);
            //the_text.alpha = 0.8;
            //the_text.setFill('#FF0000');
        }

    };

    update() {
        var self = this;
        if (this.player) {
            if (this.cursors.left.isDown) {
                this.player.x -= 5;
            }
            if (this.cursors.right.isDown) {
                this.player.x += 5;
            }
            if (this.cursors.up.isDown) {
                this.player.y -= 5;
            }
            if (this.cursors.down.isDown) {
                this.player.y += 5;
            }

            this.physics.world.wrap(this.player, 5);
        }

        var the_graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xff0000, alpha: 0.7 } });
        var line = new Phaser.Geom.Line(1210, 45, 1390, 45);

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
    };

    reset_scope() {
        total_found = 0;
        scores = {
            'blue': 0,
            'red': 0
        };
    }

    show_object_found(position, text, color) {
        console.log(arguments);
        var text = this.add.text(position.x, position.y, text, { fontSize: '40px', fill: color });
        text.setShadow(5, 5, 'rgba(0,0,0,1)', 0);

        this.tweens.add({
            targets: text,
            y: position.y - 100,
            duration: 750
        });

        this.tweens.add({
            targets: text,
            alpha: 0,
            delay: 350,
            duration: 100
        });
    }
}

var the_objects,
    line,
    graphics,
    objects = [],
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
    }, 'bow': {
        id: 'bow',
        name: 'Bow',
        found: false
    }
}

var total_objects = Object.keys(hidden_objects).length,
    total_found = 0;

function addPlayer(self) {
    self.player = self.physics.add.image(50, 50, 'cursor')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(50, 50);
}

function clickHandler(the_image, self) {
    the_image.off('clicked', this.clickHandler);
    the_image.input.enabled = false;

    if (the_image.name in hidden_objects) {
        hidden_objects[the_image.name].found = true;
        scores.blue += 1;
        total_found += 1;
        this.blueScoreText.setText(`${scores.blue} found`);
        console.log(game.input.mousePointer.x, game.input.mousePointer.x);
        this.show_object_found({ x: game.input.mousePointer.x - 40, y: game.input.mousePointer.y - 20 }, '+1', FIRST_PLAYER.color);

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

    checkWiner(this);
}


function checkWiner(self) {
    console.log(`${total_objects} - ${total_found}`);
    if (total_objects == total_found) {
        self.scene.start('donePage', { winner: "self" });
    }
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