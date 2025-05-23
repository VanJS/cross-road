// You can write more code here
/* START OF COMPILED CODE */
/* START-USER-IMPORTS */
import Phaser from 'phaser';
import PlatformPrefab from './PlatformPrefab.ts';
/* END-USER-IMPORTS */
export default class PlatformGroupPrefab extends Phaser.GameObjects.Layer {
	constructor(scene: Phaser.Scene) {
		super(scene);
		/* START-USER-CTR-CODE */
		// Initialize the platform group using the PlatformPrefab class
		this.group = scene.add.group({
			classType: PlatformPrefab,
			runChildUpdate: true,
		});

		// Create an initial platform at (640, 640)
		this.group.get(640, 640);
		// Spawn 7 additional platforms spaced vertically by 200 px
		for (let i = 1; i < 8; i++) {
			const x = Phaser.Math.Between(360, 900);
			const y = -200 * i + 640;
			this.group.get(x, y);
		}
		// Set the distance at which platforms should be recycled
		this.maxPlatformDistance = scene.scale.height * 1.3;
		this.bottomMostPlatformYposition = 720;
		/* END-USER-CTR-CODE */
	}
	/* START-USER-CODE */
	group: Phaser.GameObjects.Group; // The group containing all platform instances
	maxPlatformDistance: number; // Vertical threshold for recycling platforms
	bottomMostPlatformYposition: number;
	enableMovingPlatforms = true; // Flag to enable/disable platform movement
	currentScore = 0; // Store current score for one-time platform logic

	// Calculate speed multiplier based on score
	private calculateSpeedMultiplier(score: number): number {
		// Base speed multiplier is 1, increases by 0.3 for every 1000 points
		return 1 + Math.floor(score / 1000) * 0.3;
	}

	updateWithScore(score: number) {
		this.currentScore = score; // Store the score for use in shouldMakeOneTime
		this.update();

		// Update speed for all existing platforms based on score
		const speedMultiplier = this.calculateSpeedMultiplier(score);
		const allPlatforms = this.group.getChildren() as PlatformPrefab[];

		allPlatforms.forEach((platform) => {
			platform.updateSpeed(speedMultiplier);
		});
	}

	update() {
		const scrollY = this.scene.cameras.main.scrollY;
		// 1. Find all platforms that have moved below the recycle threshold
		const offscreen = (this.group.getChildren() as PlatformPrefab[])
			.filter((child) => child.y >= scrollY + this.maxPlatformDistance)
			// Sort from lowest to highest so the lowest platform is repositioned first
			.sort((a, b) => b.y - a.y);

		// Before recycling platforms, update the bottomMostPlatformYposition
		// Calculate it relative to the camera's scroll position for consistent behavior
		const allPlatforms = this.group.getChildren() as PlatformPrefab[];
		// Filter to get only the platforms that are still visible (not being recycled)
		const visiblePlatforms = allPlatforms.filter(
			(platform) => platform.y < scrollY + this.maxPlatformDistance
		);

		if (visiblePlatforms.length > 0) {
			// Find the platform with the highest Y value (lowest on screen)
			this.bottomMostPlatformYposition = Math.max(
				...visiblePlatforms.map((p) => p.y)
			);
		}

		// 2. Determine the current highest platform in the world (smallest y)
		const allYs = allPlatforms.map((c) => c.y);
		let highestY = Math.min(...allYs);

		// 3. Reposition each offscreen platform one by one
		offscreen.forEach((child) => {
			// Randomize the new horizontal position within bounds
			const x = Phaser.Math.Between(360, 900);
			// Calculate a random vertical gap suitable for jumping (180-220 px)
			const gap = Phaser.Math.Between(180, 220);
			// Place the platform above the current highest platform by the gap
			const y = highestY - gap;

			// Determine if this should be a one-time platform (20% chance after score > 2000)
			const shouldMakeOneTime = this.shouldMakeOneTime();

			// Reset the platform with new position and type
			child.resetPlatform(x, y, shouldMakeOneTime);

			// Update the baseline for the next platform
			highestY = y;

			// Only enable movement for platforms (both regular and one-time can move)
			if (this.enableMovingPlatforms) {
				if (Phaser.Math.Between(0, 1) == 1) {
					child.startPlatformMovement();
				} else {
					child.stopPlatformMovement();
				}
			}
		});
	}

	// Determine if a platform should be made one-time
	private shouldMakeOneTime(): boolean {
		// Use the stored current score
		const score = this.currentScore;

		// Only create one-time platforms after score > 1500
		if (score <= 1500) return false;

		// Calculate chance: 20% initially, +10% every 500 points, max 80%
		const baseChance = 20;
		const bonusIntervals = Math.floor((score - 1500) / 500);
		const totalChance = Math.min(baseChance + bonusIntervals * 10, 80);

		// Convert percentage to random check
		return Phaser.Math.Between(1, 100) <= totalChance;
	}
	/* END-USER-CODE */
}
/* END OF COMPILED CODE */
// You can write more code here
