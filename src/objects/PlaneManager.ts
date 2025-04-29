import Phaser from 'phaser';
import Plane from './Plane';
import Duck from './Duck';

export default class PlaneManager {
	private scene: Phaser.Scene;
	private planes: Phaser.Physics.Arcade.Group;
	private spawnTimer: Phaser.Time.TimerEvent;
	private moveTimer: Phaser.Time.TimerEvent;
	private duck: Duck;
	private isPlayerInvincible: boolean = false;

	constructor(scene: Phaser.Scene, duck: Duck) {
		this.scene = scene;
		this.duck = duck;

		// Create a physics group for planes
		this.planes = scene.physics.add.group({
			classType: Plane,
			runChildUpdate: true, // Automatically run update on all planes
		});

		// Set up collision with duck
		scene.physics.add.overlap(
			this.duck,
			this.planes,
			this
				.handlePlaneDuckCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
			undefined,
			this
		);

		// Set up recurring spawn timer - spawn planes every 2 seconds
		this.spawnTimer = scene.time.addEvent({
			delay: 2000,
			callback: this.spawnPlane,
			callbackScope: this,
			loop: true,
		});

		// Set up a separate timer to randomly move planes - check every 1 second
		this.moveTimer = scene.time.addEvent({
			delay: 1000,
			callback: this.moveRandomPlane,
			callbackScope: this,
			loop: true,
		});
	}

	// Spawn a new plane with random color at random height
	private spawnPlane(): void {
		// Get random plane color
		const colorIndex = Phaser.Math.Between(0, Plane.COLORS.length - 1);
		const color = Plane.COLORS[colorIndex];

		// Get random y position within screen bounds with some padding
		const minY = 50;
		const maxY = this.scene.cameras.main.height - 50;
		const y = Phaser.Math.Between(minY, maxY);

		// Create plane at a random position along the left side
		const x = Phaser.Math.Between(0, this.scene.cameras.main.width / 3);

		// Create the plane and add to group
		const plane = new Plane(this.scene, x, y, color);
		this.planes.add(plane);
	}

	// Randomly select a plane to start moving
	private moveRandomPlane(): void {
		const planesArray = this.planes.getChildren();
		if (planesArray.length === 0) return;

		// Randomly select a plane
		const randomIndex = Phaser.Math.Between(0, planesArray.length - 1);
		const selectedPlane = planesArray[randomIndex] as Plane;

		// Only move the plane if it's not already moving
		if (selectedPlane.body?.velocity.x === 0) {
			// Random speed between 50 and 150
			const speed = Phaser.Math.Between(50, 150);
			selectedPlane.startMoving(speed);
		}
	}

	// Handle collision between duck and plane
	private handlePlaneDuckCollision(
		duckObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
		planeObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
	): void {
		// Skip if player is already invincible
		if (this.isPlayerInvincible) return;

		// Make player invincible
		this.isPlayerInvincible = true;

		// Get the duck sprite
		const duck = duckObj as Duck;

		// Make duck blink to indicate invincibility
		this.scene.tweens.add({
			targets: duck,
			alpha: 0.5,
			duration: 100,
			yoyo: true,
			repeat: 5,
			onComplete: () => {
				duck.setAlpha(1);
				this.isPlayerInvincible = false;
			},
		});
	}

	// Update method for external calling
	update(): void {
		// Any additional per-frame updates if needed
	}

	// Clean up resources when destroyed
	destroy(): void {
		if (this.spawnTimer) {
			this.spawnTimer.destroy();
		}

		if (this.moveTimer) {
			this.moveTimer.destroy();
		}

		this.planes.clear(true, true); // Destroy all planes
	}
}
