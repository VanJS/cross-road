import Phaser from 'phaser';

export default class Plane extends Phaser.Physics.Arcade.Sprite {
  // Available plane colors
  static readonly COLORS = ['blue', 'pink', 'red', 'yellow'];
  private scaleSize: number = 0.1; // Scale factor for the plane size

  constructor(scene: Phaser.Scene, x: number, y: number, color: string = 'blue') {
    // Use the correct texture key based on color
    super(scene, x, y, `plane_${color}`);

    // Add sprite to the scene
    scene.add.existing(this);

    // Enable physics
    scene.physics.add.existing(this);

    // Make the plane smaller by setting scale
    this.setScale(this.scaleSize);

    // Set physics properties
    this.setVelocity(0, 0); // No automatic movement

    // Set properties for bounds checking
    this.setActive(true);
    this.setVisible(true);

    // Adjust the hitbox size to match the visual size
    if (this.body) {
      // Force a smaller hitbox for better collision detection
      const hitboxWidth = this.width * this.scaleSize * 0.8;
      const hitboxHeight = this.height * this.scaleSize * 0.6;
      this.body.setSize(hitboxWidth, hitboxHeight);

      // Center the hitbox
      this.body.setOffset((this.width - hitboxWidth) / 2, (this.height - hitboxHeight) / 2);
    }
  }

  // Method to manually start movement
  startMoving(speed: number): void {
    this.setVelocityX(speed);

    // Flip sprite if moving left
    if (speed < 0) {
      this.setFlipX(true);
    }
  }

  // Method to check if plane is out of bounds
  update(): void {
    const screenWidth = this.scene.cameras.main.width;

    // Check if plane is off screen based on direction
    if (this.x > screenWidth + this.width || this.x < -this.width) {
      this.destroy();
    }
  }

  // Static method to preload plane assets
  static preloadAssets(scene: Phaser.Scene): void {
    // Load all plane colors
    Plane.COLORS.forEach((color) => {
      const key = `plane_${color}`;
      scene.load.image(key, `assets/plane_1/plane_1_${color}.png`);
    });
  }
}
