var config = {
  type: Phaser.AUTO,
  width: 1100,
  height: 600,
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

function preload() {
  this.load.image('background', 'assets/bg/kawaii.png');
  this.load.image('cursor', 'assets/cursor.png');
};

function create() {

  var self = this;

  this.add.image(400, 300, 'background');
  addPlayer(self);
  // this.add.image(400, 300, 'cursor');

  this.cursors = this.input.keyboard.createCursorKeys();
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

    if (this.cursors.space.isDown) {
      this.player.setTint(0xffffff);
      validateChoice(this.player.x, this.player.y);
    }
  }
};

function addPlayer(self) {
  self.player = self.physics.add.image(50, 50, 'cursor')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(50, 50);
}

function validateChoice(x, y) {
  if ()
}