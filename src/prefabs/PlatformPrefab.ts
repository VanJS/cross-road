// You can write more code here
/* START OF COMPILED CODE */
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */
export default interface PlatformPrefab {
	body: Phaser.Physics.Arcade.Body;
}
export default class PlatformPrefab extends Phaser.Physics.Arcade.Image {
	constructor(
		scene: Phaser.Scene,
		x?: number,
		y?: number,
		texture?: string,
		frame?: number | string
	) {
		super(scene, x ?? 0, y ?? 0, texture || 'cloud_shape2_1', frame);
		this.scaleX = 0.8;
		this.scaleY = 0.5;
		scene.physics.add.existing(this, false);
		this.body.allowGravity = false;
		this.body.checkCollision.down = false;
		this.body.checkCollision.left = false;
		this.body.checkCollision.right = false;
		this.body.pushable = false;
		this.body.setOffset(0, 16);
		this.body.setSize(272, 45, false);
		/* START-USER-CTR-CODE */
		this.baseHorizontalVelocity = 50; // Base speed
		this.horizontalVelocity = 50;
		this.minXPosition = 360;
		this.maxXPosition = 900;
		this.speedMultiplier = 1; // Current speed multiplier
		this.enablePlatformMovement = false;

		// One-time platform properties
		this.isOneTime = false;
		this.hasBeenUsed = false;
		this.originalAlpha = 1;
		this.originalTint = 0xffffff;
		/* END-USER-CTR-CODE */
	}
	/* START-USER-CODE */
	// Write your code here.
	baseHorizontalVelocity; // Base speed that doesn't change
	horizontalVelocity; // Current speed (base * multiplier)
	minXPosition;
	maxXPosition;
	enablePlatformMovement;
	speedMultiplier; // Speed multiplier based on score

	// One-time platform properties
	isOneTime: boolean;
	hasBeenUsed: boolean;
	originalAlpha: number;
	originalTint: number;

	// Convert this platform to a one-time platform
	makeOneTime() {
		this.isOneTime = true;
		this.hasBeenUsed = false;
		// Visual changes to indicate it's a one-time platform
		this.setAlpha(0.7);
		this.setTint(0xffcccc);
		this.setScale(0.8, 0.5); // Ensure correct scale
		this.body.enable = true; // Ensure physics body is enabled
		this.setVisible(true); // Ensure it's visible
		// One-time platforms can now move like regular platforms
	}

	// Convert back to regular platform
	makeRegular() {
		this.isOneTime = false;
		this.hasBeenUsed = false;
		this.setAlpha(this.originalAlpha);
		this.setTint(this.originalTint);
		this.setScale(0.8, 0.5); // Reset to original scale
		this.body.enable = true; // Ensure physics body is enabled
		this.setVisible(true);
	}

	// Called when player lands on this platform
	onPlayerLand() {
		if (this.isOneTime && !this.hasBeenUsed) {
			this.hasBeenUsed = true;

			// Create disappearing effect but don't actually disable the platform
			this.scene.tweens.add({
				targets: this,
				alpha: 0,
				scaleX: 0.6,
				scaleY: 0.3,
				duration: 500,
				ease: 'Power2',
				onComplete: () => {
					// Disable collision temporarily but keep physics body for recycling
					this.body.enable = false;
					this.setVisible(false);
				},
			});
		}
	}

	// Reset the platform for reuse (called when recycling)
	resetPlatform(x: number, y: number, makeOneTime: boolean = false) {
		this.x = x;
		this.y = y;

		if (makeOneTime) {
			this.makeOneTime();
		} else {
			this.makeRegular();
		}
	}

	// Update speed based on score multiplier
	updateSpeed(multiplier: number) {
		this.speedMultiplier = multiplier;
		this.horizontalVelocity = this.baseHorizontalVelocity * multiplier;
		// If platform is currently moving, update its velocity
		if (this.enablePlatformMovement && this.body.velocity.x !== 0) {
			// Maintain direction but update speed
			const direction = this.body.velocity.x > 0 ? 1 : -1;
			this.body.velocity.x = this.horizontalVelocity * direction;
		}
	}

	update() {
		if (!this.enablePlatformMovement) return;
		const velocity = this.body.velocity;
		// Check if the platform is moving to the right
		if (this.x < this.minXPosition) {
			// Move right
			velocity.x = this.horizontalVelocity;
		} else if (this.x > this.maxXPosition) {
			// Move left
			velocity.x = -this.horizontalVelocity;
		}
	}

	startPlatformMovement() {
		// Both regular and one-time platforms can move
		this.body.velocity.x = this.horizontalVelocity;
		this.enablePlatformMovement = true;
	}

	stopPlatformMovement() {
		this.body.velocity.x = 0;
		this.enablePlatformMovement = false;
	}
	/* END-USER-CODE */
}
/* END OF COMPILED CODE */
// You can write more code here
