class GameScene extends Phaser.Scene {
    constructor() {
        super('gamingPage');
    }

    create() {
        this.add.text(200, 200, 'Gaming screen');
    }

    preload() {
        this.load.image('background', 'assets/bg/kawaii.png');
        this.load.image('cursor', 'assets/cursor.png');
        for (var i = 0; i < hidden_objects.length; i++) {
            this.load.image(hidden_objects[i].id, `assets/${hidden_objects[i].id}.png`);
        }
    };

    create() {
        this.graphics = this.add.graphics({ lineStyle: { width: 10, color: 0xff0000 } });

        var self = this;

        this.add.image(700, 400, 'background');
        // this.add.image(100, 100, 'robot');
        // this.robot = self.physics.add.image(50, 50, 'robot')
        //   .setOrigin(0.5, 0.5)
        //   .setDisplaySize(50, 50);

        // this.add.image(400, 300, 'cursor');

        this.cursors = this.input.keyboard.createCursorKeys();

        // platforms = this.physics.add.staticGroup();

        // this.physics.add.collider(this.player, platforms);

        // adding objects to find
        the_objects = this.physics.add.group();
        for (var i = 0; i < hidden_objects.length; i++) {
            the_objects.create(
                Math.floor(Math.random() * (WIN_WIDTH - 200) + 50),
                Math.floor(Math.random() * (WIN_HEIGHT - 50) + 50),
                hidden_objects[i].id
            );
        }

        // hidden_objects = this.physics.add.group({
        //   key: 'owl',
        //   setXY: { x: Math.floor(Math.random() * (WIN_WIDTH - 50) + 50), y: Math.floor(Math.random() * (WIN_HEIGHT - 50) + 50) }
        // });

        addPlayer(self);
        /*
          var panda = this.physics.add.image(400, 100, 'panda');
          panda.name = 'panda_1';
        
          var panda2 = this.physics.add.image(420, 100, 'panda');
          panda2.name = 'panda_2';
        */
        // sprite = game.scene.add.sprite(300, 200, 'panda');

        // game.physics.enable(panda, Phaser.Physics.ARCADE);

        /*
        this.physics.add.overlap(
          this.player,
          panda,
          collectItem,
          null,
          this
        );
      
        this.physics.add.overlap(
          this.player,
          panda2,
          collectItem,
          null,
          this
        );
        */

        this.physics.add.overlap(
            this.player,
            the_objects,
            collectItem,
            null,
            this
        );

        // Words background
        this.add.rectangle(1300, 400, 200, 800, 0x000000);

        // background players
        this.add.rectangle(100, 35, 200, 50, 0x000000, 0.7);
        this.add.rectangle(1100, 35, 200, 50, 0x000000, 0.7);

        this.blueScoreText = this.add.text(16, 18, '00 found', { fontSize: '32px', fill: '#0077FF' });
        this.blueScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        this.redScoreText = this.add.text(1025, 18, '00 found', { fontSize: '32px', fill: '#FF0000' });
        this.redScoreText.setShadow(3, 3, 'rgba(255,255,255,0.3)', 0);

        for (var i = 0; i < hidden_objects.length; i++) {
            this.add.text(1220, (50 * i) + 30, hidden_objects[i].name, { fontSize: getFontSize(hidden_objects[i].name), fill: '#FFFFFF' });
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

        for (var i = 0; i < hidden_objects.length; i++) {
            if (hidden_objects[i].found) {
                the_graphics.strokeLineShape(line);
            }
            line.y1 += 50;
            line.y2 += 50;
        }

    };
}

var the_objects,
    line,
    graphics,
    objects = [],
    scores = {
        'blue': 0,
        'red': 0
    },
    hidden_objects = [{
        id: 'robot',
        name: 'Robot',
        found: false
    }, {
        id: 'bow',
        name: 'Bow',
        found: false
    }, {
        id: 'cactus',
        name: 'Cactus',
        found: false
    }, {
        id: 'cloud',
        name: 'Cloud',
        found: false
    }, {
        id: 'hamster',
        name: 'Hamster',
        found: false
    }, {
        id: 'ice_cream',
        name: 'Ice Cream',
        found: false
    }, {
        id: 'lollypop',
        name: 'Lolly-Pop',
        found: false
    }, {
        id: 'owl',
        name: 'Owl',
        found: false
    }, {
        id: 'panda',
        name: 'Panda',
        found: false
    }, {
        id: 'unicorn_cake',
        name: 'Unicorn Cake',
        found: false
    }, {
        id: 'rice_bowl',
        name: 'Rice Bowl',
        found: false
    }];

var total_objects = hidden_objects.length,
    total_found = 0;



function addPlayer(self) {
    self.player = self.physics.add.image(50, 50, 'cursor')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(50, 50);
}

function collectItem(player, one_object) {
    if (this.cursors.space.isDown) {
        validateChoice(this, one_object);
        checkWiner();
    }
}

function validateChoice(self, one_object) {
    var selected = false;
    for (var i = 0; i < hidden_objects.length; i++) {
        if (one_object.texture.key == hidden_objects[i].id) {
            total_found += 1;
            console.log('dont do more than one!' + selected);
            one_object.disableBody(true, true);
            hidden_objects[i].found = true;

            updateScore(self, one_object);
            selected = true;
            return;
        }
    }
}

function checkWiner() {
    if (total_objects == total_found) {
        // move to game over screen
        alert('winner!' + scores.blue + ' or ' + scores.red);
    }
}

function updateScore(self, one_object) {
    scores.blue += 1;
    self.blueScoreText.setText(`${scores.blue} found`);
}

function getFontSize(str) {
    const lenStr = str.length;
    if (lenStr > 11) {
        return '22px';
    }
    return '25px';
}