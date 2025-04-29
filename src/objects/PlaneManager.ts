import Phaser from 'phaser';
import Plane from './Plane';
import Duck from './Duck';

interface Lane {
	y: number; // Y position of the lane
	speed: number; // Speed of planes in this lane
	lastSpawnTime: number; // Last time a plane was spawned on this lane
	direction: number; // 1 for right, -1 for left
	isActive: boolean; // Whether the lane is currently active
}

export default class PlaneManager {
	private scene: Phaser.Scene;
	private planes: Phaser.Physics.Arcade.Group;
	private spawnTimer: Phaser.Time.TimerEvent;
	private duck: Duck;
	private isPlayerInvincible: boolean = false;
	private lanes: Lane[] = [];
	private laneHeight: number = 64; // Height between each lane
	private minDistanceBetweenPlanes: number = 200; // Minimum distance between planes in the same lane
	private spawnChance: number = 0.3; // Chance to spawn a plane on each lane check

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

		// Setup lanes
		this.setupLanes();

		// Set up recurring spawn timer - check lanes every 1.5 seconds
		this.spawnTimer = scene.time.addEvent({
			delay: 1500,
			callback: this.checkLanesForSpawning,
			callbackScope: this,
			loop: true,
		});
	}

	// Setup lanes across the screen
	private setupLanes(): void {
		const screenHeight = this.scene.cameras.main.height;
		const numLanes = Math.floor(screenHeight / this.laneHeight);

		for (let i = 0; i < numLanes; i++) {
			// Calculate y position for this lane
			const y = i * this.laneHeight + this.laneHeight / 2;

			// Create lane with random speed and direction
			const speed = Phaser.Math.Between(50, 150);
			const direction = Math.random() > 0.5 ? 1 : -1;

			this.lanes.push({
				y,
				speed,
				lastSpawnTime: 0,
				direction,
				isActive: Math.random() > 0.3, // 70% of lanes are active at start
			});
		}
	}

	// Check lanes for spawning new planes
	private checkLanesForSpawning(): void {
		const currentTime = this.scene.time.now;
		const screenWidth = this.scene.cameras.main.width;

		// Check each lane
		this.lanes.forEach((lane) => {
			// Skip inactive lanes
			if (!lane.isActive) return;

			// Check if enough time has passed since last spawn and random chance
			const timeThreshold = Phaser.Math.Between(2000, 5000); // Random time between 2-5 seconds
			if (
				currentTime - lane.lastSpawnTime > timeThreshold &&
				Math.random() < this.spawnChance
			) {
				// Check if there's enough space in the lane
				if (this.canSpawnInLane(lane)) {
					this.spawnPlaneInLane(lane);
					lane.lastSpawnTime = currentTime;
				}
			}
		});
	}

	// Check if we can spawn a plane in this lane
	private canSpawnInLane(lane: Lane): boolean {
		const planesInLane = this.getPlanesInLane(lane);
		if (planesInLane.length === 0) return true;

		// If planes move right, check left side
		if (lane.direction > 0) {
			const rightmostPlane = planesInLane.reduce((prev, current) => {
				return prev.x < current.x ? prev : current;
			});
			return rightmostPlane.x > this.minDistanceBetweenPlanes;
		}
		// If planes move left, check right side
		else {
			const leftmostPlane = planesInLane.reduce((prev, current) => {
				return prev.x > current.x ? prev : current;
			});
			const screenWidth = this.scene.cameras.main.width;
			return (
				screenWidth - leftmostPlane.x > this.minDistanceBetweenPlanes
			);
		}
	}

	// Get all planes in a specific lane
	private getPlanesInLane(lane: Lane): Plane[] {
		return this.planes.getChildren().filter((plane) => {
			const planeY = plane.y;
			return Math.abs(planeY - lane.y) < 10; // 10 pixel tolerance
		}) as Plane[];
	}

	// Spawn a plane in a specific lane
	private spawnPlaneInLane(lane: Lane): void {
		// Get random plane color
		const colorIndex = Phaser.Math.Between(0, Plane.COLORS.length - 1);
		const color = Plane.COLORS[colorIndex];

		// Position based on direction
		const screenWidth = this.scene.cameras.main.width;
		let x;

		if (lane.direction > 0) {
			// Moving right, spawn at left
			x = -50;
		} else {
			// Moving left, spawn at right
			x = screenWidth + 50;
		}

		// Create the plane
		const plane = new Plane(this.scene, x, lane.y, color);
		this.planes.add(plane);

		// Start moving the plane
		plane.startMoving(lane.speed * lane.direction);
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

		this.planes.clear(true, true); // Destroy all planes
	}
}
