const WIN_WIDTH = 1400;
const WIN_HEIGHT = 800;

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
  scene: [StartScene, GameScene, GameOverScene]
}

var game = new Phaser.Game(config);