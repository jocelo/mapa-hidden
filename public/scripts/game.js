const WIN_WIDTH = 1100;
const WIN_HEIGHT = 600;

var config = {
  type: Phaser.AUTO,
  width: WIN_WIDTH,
  height: WIN_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

var game = new Phaser.Game(config);
var objects = [];
var scores = {
  'blue': 0,
  'red': 0
};
var platforms = [];
var the_objects;
var hidden_objects = [{
  id: 'robot',
  name: 'Robot',
}, {
  id: 'bow',
  name: 'Bow',
}, {
  id: 'cactus',
  name: 'Cactus',
}, {
  id: 'cloud',
  name: 'Cloud',
}, {
  id: 'hamster',
  name: 'Hamster',
}, {
  id: 'ice_cream',
  name: 'Ice Cream',
}, {
  id: 'lollypop',
  name: 'Lolly-Pop',
}, {
  id: 'owl',
  name: 'Owl',
}, {
  id: 'panda',
  name: 'Panda',
}, {
  id: 'rice_bowl',
  name: 'Rice Bowl',
}, {
  id: 'unicorn_cake',
  name: 'Unicorn Cake',
}
];
var bombs;
var platforms;

function preload() {
  this.load.image('background', 'assets/bg/kawaii.png');
  this.load.image('cursor', 'assets/cursor.png');
  for (var i = 0; i < hidden_objects.length; i++) {
    this.load.image(hidden_objects[i].id, `assets/${hidden_objects[i].id}.png`);
  }
};

function create() {

  var self = this;

  this.add.image(400, 300, 'background');
  // this.add.image(100, 100, 'robot');
  // this.robot = self.physics.add.image(50, 50, 'robot')
  //   .setOrigin(0.5, 0.5)
  //   .setDisplaySize(50, 50);

  // this.add.image(400, 300, 'cursor');

  this.cursors = this.input.keyboard.createCursorKeys();

  platforms = this.physics.add.staticGroup();

  // this.physics.add.collider(this.player, platforms);

  // adding objects to find
  the_objects = this.physics.add.group();
  for (var i = 0; i < hidden_objects.length; i++) {
    the_objects.create(
      Math.floor(Math.random() * (WIN_WIDTH - 50) + 50),
      Math.floor(Math.random() * (WIN_HEIGHT - 50) + 50),
      hidden_objects[i].id
    );
  }

  // hidden_objects = this.physics.add.group({
  //   key: 'owl',
  //   setXY: { x: Math.floor(Math.random() * (WIN_WIDTH - 50) + 50), y: Math.floor(Math.random() * (WIN_HEIGHT - 50) + 50) }
  // });

  addPlayer(self);

  this.physics.add.overlap(
    this.player,
    the_objects,
    collectStar,
    null,
    this
  );

  this.blueScoreText = this.add.text(16, 16, '0 found', { fontSize: '32px', fill: '#0000FF' });
  this.redScoreText = this.add.text(584, 16, '2 found', { fontSize: '32px', fill: '#FF0000' });

  for (var i = 0; i < hidden_objects.length; i++) {
    this.add.text(1000, 40 * i, hidden_objects[i].name, { fontSize: '25px', fill: '#000000' });
  }

};

function update() {
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

    // this.physics.arcade.collide(this.player, this.robot, mycustomcreatespritefunction);
  }
};

function addPlayer(self) {
  self.player = self.physics.add.image(50, 50, 'cursor')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(50, 50);
}

function collectStar(player, one_object) {

  if (this.cursors.space.isDown) {
    one_object.disableBody(true, true);
    validateChoice(this);
  }
  return 0;
}

function validateChoice(self) {
  scores.blue += 1;
  updateScore(self);
}

function updateScore(self) {
  self.blueScoreText.setText(`${scores.blue} found`);
}