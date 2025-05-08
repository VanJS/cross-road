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
	private hitSound: Phaser.Sound.BaseSound;

	// Fixed properties for game balance
	private laneHeight: number = 64; // Base height between lanes
	private laneSpacing: number = 2; // Spawn planes on every Nth row (higher = more sparse)
	private baseSpeed: number = 300; // Base speed for planes (increased from 100)
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

		// Load hit sound effect
		this.hitSound = scene.sound.add('hit_plane', {
			volume: 0.7,
			loop: false,
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

	// Setup lanes across the screen with fixed spacing
	private setupLanes(): void {
		const screenHeight = this.scene.cameras.main.height;
		const totalPossibleLanes = Math.floor(screenHeight / this.laneHeight);

		// Only create lanes at every Nth position based on laneSpacing
		for (let i = 0; i < totalPossibleLanes; i += this.laneSpacing) {
			// Calculate y position for this lane
			const y = i * this.laneHeight + this.laneHeight / 2;

			// Create lane with speed variation
			const speed = Phaser.Math.Between(
				this.baseSpeed - 30,
				this.baseSpeed + 30
			);

			// IMPORTANT: Truly random direction
			// This should be 50/50 chance of left or right
			const direction = Math.random() > 0.5 ? 1 : -1;

			// Create a lane with the random direction
			this.lanes.push({
				y,
				speed,
				lastSpawnTime: 0,
				direction,
				isActive: Math.random() > 0.3, // 70% of lanes are active at start
			});

			// Debug log to check direction ratio
			console.log(
				`Created lane at Y=${y} with direction=${direction} (${
					direction > 0 ? 'right' : 'left'
				})`
			);
		}

		console.log(
			`Created ${this.lanes.length} lanes with spacing of ${this.laneSpacing}`
		);
	}

	// Check lanes for spawning new planes
	private checkLanesForSpawning(): void {
		const currentTime = this.scene.time.now;

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
			// FIXED: For right-moving planes, we need the leftmost plane, not rightmost
			const leftmostPlane = planesInLane.reduce((prev, current) => {
				return prev.x < current.x ? prev : current;
			});
			// Need enough space from left edge
			return leftmostPlane.x > this.minDistanceBetweenPlanes;
		}
		// If planes move left, check right side
		else {
			// FIXED: For left-moving planes, we need the rightmost plane, not leftmost
			const rightmostPlane = planesInLane.reduce((prev, current) => {
				return prev.x > current.x ? prev : current;
			});
			// Need enough space from right edge
			const screenWidth = this.scene.cameras.main.width;
			return (
				screenWidth - rightmostPlane.x > this.minDistanceBetweenPlanes
			);
		}
	}

	// Get all planes in a specific lane
	private getPlanesInLane(lane: Lane): Plane[] {
		return this.planes.getChildren().filter((child) => {
			// Safe cast to Plane since we know these are plane objects
			const plane = child as Plane;
			// Check if plane's y position is close to lane y position
			return Math.abs(plane.y - lane.y) < 10; // 10 pixel tolerance
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

		// Start moving the plane with lane's speed
		plane.startMoving(lane.speed * lane.direction);

		// Debug log to confirm plane movement direction
		console.log(
			`Spawned plane at Y=${lane.y} moving ${
				lane.direction > 0 ? 'right' : 'left'
			} with speed=${lane.speed * lane.direction}`
		);
	}

	// Handle collision between duck and plane
	private handlePlaneDuckCollision(
		duckObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
		// planeObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
	): void {
		// Skip if player is already invincible
		if (this.isPlayerInvincible) return;

		// Make player invincible
		this.isPlayerInvincible = true;

		// Play hit sound
		this.hitSound.play();

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

		// Stop any sounds
		if (this.hitSound?.isPlaying) {
			this.hitSound.stop();
		}

		this.planes.clear(true, true); // Destroy all planes
	}
}
