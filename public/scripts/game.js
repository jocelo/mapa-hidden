const WIN_WIDTH = 1400;
const GAME_WIDTH = 1200;
const WIN_HEIGHT = 800;
const FIRST_PLAYER = {
  color: '#0077FF'
};
const SECOND_PLAYER = {
  color: '#FF0000'
};

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