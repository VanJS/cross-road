import Phaser from 'phaser';

class CrossRoadScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite; // Declare player property
  cameraSpeed: number = 2; // Declare cameraSpeed property

  constructor() {
    super('CrossRoadScene');
  }

  preload() {
    this.load.image('player', 'assets/player.png'); // Replace with your own sprite
    this.load.image('tile', 'assets/tile.png');     // Replace with your background tiles
  }

  create() {
    // Create a tilemap-like background (for demo purposes)
    for (let y = 0; y < 50; y++) {
      for (let x = 0; x < 10; x++) {
        this.add.image(x * 64, -y * 64, 'tile');
      }
    }

    // Create the player sprite
    this.player = this.physics.add.sprite(64 * 5, 0, 'player');
    this.player.setCollideWorldBounds(true);

    // Camera settings
    this.cameras.main.setBounds(0, -64 * 50, 64 * 10, 64 * 50);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setLerp(0.1, 0.1); // Smooth follow

    // Optional: keep player fixed vertically in lower part of screen
    this.cameras.main.setDeadzone(0, 200);
  }

  update() {
    // Move camera forward continuously
    this.cameras.main.scrollY += this.cameraSpeed;

    // Check if the player is out of bounds (past the camera's view)
    if (this.player.y > this.cameras.main.scrollY + this.cameras.main.height) {
      this.playerDie(); // Player dies if out of camera bounds
    }

    // Ensure `this.input.keyboard` is not null before accessing
    const cursors = this.input.keyboard?.createCursorKeys();
    if (cursors) {
      if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
        this.player.y -= 64;
      } else if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
        this.player.y += 64;
      } else if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
        this.player.x -= 64;
      } else if (Phaser.Input.Keyboard.JustDown(cursors.right)) {
        this.player.x += 64;
      }
    }
  }

  // Method to handle player's death
  playerDie() {
    // Reset the player position or do any other game-over logic
    this.player.setPosition(64 * 5, 0); // Reset player position
    this.cameras.main.scrollY = 0; // Reset camera position to start
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  physics: {
    default: 'arcade',
  },
  scene: CrossRoadScene,
};

const game = new Phaser.Game(config);
