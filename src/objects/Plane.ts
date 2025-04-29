import Phaser from 'phaser';

export default class Plane extends Phaser.Physics.Arcade.Sprite {
	private planeColor: string;
	private scaleSize: number = 0.1; // Scale factor for the plane size

	// Available plane colors
	static readonly COLORS = ['blue', 'pink', 'red', 'yellow'];

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		color: string = 'blue'
	) {
		// Use the correct texture key based on color
		super(scene, x, y, `plane_${color}`);

		// Add sprite to the scene
		scene.add.existing(this);

		// Enable physics
		scene.physics.add.existing(this);

		// Store the plane color
		this.planeColor = color;

		// Make the plane smaller by setting scale
		this.setScale(this.scaleSize);

		// Set physics properties
		this.setVelocity(0, 0); // No automatic movement

		// Set properties for bounds checking
		this.setActive(true);
		this.setVisible(true);

		// Adjust the hitbox size to match the visual size
		this.body?.setSize(
			this.width * this.scaleSize,
			this.height * this.scaleSize
		);
	}

	// Method to manually start movement
	startMoving(speed: number): void {
		this.setVelocityX(speed);
	}

	// Method to check if plane is out of bounds
	update(): void {
		// If the plane has moved off the right edge of the screen
		if (this.x > this.scene.cameras.main.width + this.width) {
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
