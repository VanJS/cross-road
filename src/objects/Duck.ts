import Phaser from 'phaser';

export default class Duck extends Phaser.Physics.Arcade.Sprite {
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	private gamepad: Phaser.Input.Gamepad.Gamepad | null = null;
	private direction: 'left' | 'right' = 'right';
	private moveSpeed: number = 150;
	private animationTypes = ['duck_idle', 'duck_walk'];

	constructor(scene: Phaser.Scene, x: number, y: number) {
		// Initialize with the idle animation texture
		super(scene, x, y, 'duck_idle');
		// Add sprite to the scene
		scene.add.existing(this);
		// Enable physics
		scene.physics.add.existing(this);
		// Set physics properties
		this.setCollideWorldBounds(true);
		// Create animations
		this.createAnimations();
		// Setup input
		this.cursors =
			scene.input.keyboard?.createCursorKeys() ||
			({} as Phaser.Types.Input.Keyboard.CursorKeys);
		// Start with idle animation
		this.play('duck_idle');
	}

	private createAnimations(): void {
		// Create all animations using switch case
		for (const animType of this.animationTypes) {
			// Skip if animation already exists
			if (this.scene.anims.exists(animType)) continue;

			// Define animation parameters based on type
			switch (animType) {
				case 'duck_idle':
					this.scene.anims.create({
						key: 'duck_idle',
						frames: this.scene.anims.generateFrameNames(
							'duck_idle',
							{
								prefix: 'duckee_idle',
								start: 1,
								end: 4,
								suffix: '.png',
							}
						),
						frameRate: 8,
						repeat: -1,
					});
					break;

				case 'duck_walk':
					this.scene.anims.create({
						key: 'duck_walk',
						frames: this.scene.anims.generateFrameNames(
							'duck_walk',
							{
								prefix: 'duckee_walk_run',
								start: 1,
								end: 4,
								suffix: '.png',
							}
						),
						frameRate: 10,
						repeat: -1,
					});
					break;

				// Add more animation cases here if needed
			}
		}
	}

	update(): void {
		// Handle gamepad connection
		this.handleGamepadConnection();

		// Get movement input
		const movementState = this.getMovementState();

		// Reset velocity
		this.setVelocity(0, 0);

		// Handle movement based on movement state
		switch (movementState) {
			case 'left':
				this.direction = 'left';
				this.setFlipX(true);
				this.setVelocityX(-this.moveSpeed);
				this.play('duck_walk', true);
				break;

			case 'right':
				this.direction = 'right';
				this.setFlipX(false);
				this.setVelocityX(this.moveSpeed);
				this.play('duck_walk', true);
				break;

			case 'up':
				this.setVelocityY(-this.moveSpeed);
				this.play('duck_walk', true);
				break;

			case 'down':
				this.setVelocityY(this.moveSpeed);
				this.play('duck_walk', true);
				break;

			case 'upLeft':
				this.direction = 'left';
				this.setFlipX(true);
				this.setVelocity(
					-this.moveSpeed / Math.sqrt(2),
					-this.moveSpeed / Math.sqrt(2)
				);
				this.play('duck_walk', true);
				break;

			case 'upRight':
				this.direction = 'right';
				this.setFlipX(false);
				this.setVelocity(
					this.moveSpeed / Math.sqrt(2),
					-this.moveSpeed / Math.sqrt(2)
				);
				this.play('duck_walk', true);
				break;

			case 'downLeft':
				this.direction = 'left';
				this.setFlipX(true);
				this.setVelocity(
					-this.moveSpeed / Math.sqrt(2),
					this.moveSpeed / Math.sqrt(2)
				);
				this.play('duck_walk', true);
				break;

			case 'downRight':
				this.direction = 'right';
				this.setFlipX(false);
				this.setVelocity(
					this.moveSpeed / Math.sqrt(2),
					this.moveSpeed / Math.sqrt(2)
				);
				this.play('duck_walk', true);
				break;

			case 'idle':
			default:
				this.play('duck_idle', true);
				break;
		}
	}

	private handleGamepadConnection(): void {
		// Find the first connected gamepad if available and not already set
		if (!this.gamepad && this.scene.input.gamepad?.total) {
			this.gamepad = this.scene.input.gamepad.getPad(0);
		}
	}

	private getMovementState(): string {
		// Initialize movement values
		let movingLeft = false;
		let movingRight = false;
		let movingUp = false;
		let movingDown = false;

		// Handle keyboard input
		if (this.cursors.left?.isDown) {
			movingLeft = true;
		}
		if (this.cursors.right?.isDown) {
			movingRight = true;
		}
		if (this.cursors.up?.isDown) {
			movingUp = true;
		}
		if (this.cursors.down?.isDown) {
			movingDown = true;
		}

		// Add gamepad controls if a gamepad is connected
		if (this.gamepad) {
			// Left stick or D-pad for movement
			if (this.gamepad.leftStick.x < -0.5 || this.gamepad.left) {
				movingLeft = true;
			}
			if (this.gamepad.leftStick.x > 0.5 || this.gamepad.right) {
				movingRight = true;
			}
			if (this.gamepad.leftStick.y < -0.5 || this.gamepad.up) {
				movingUp = true;
			}
			if (this.gamepad.leftStick.y > 0.5 || this.gamepad.down) {
				movingDown = true;
			}
		}

		// Prevent opposite directions from canceling each other
		if (movingLeft && movingRight) {
			movingLeft = movingRight = false;
		}
		if (movingUp && movingDown) {
			movingUp = movingDown = false;
		}

		// Determine movement state
		if (movingUp && movingLeft) return 'upLeft';
		if (movingUp && movingRight) return 'upRight';
		if (movingDown && movingLeft) return 'downLeft';
		if (movingDown && movingRight) return 'downRight';
		if (movingLeft) return 'left';
		if (movingRight) return 'right';
		if (movingUp) return 'up';
		if (movingDown) return 'down';

		return 'idle';
	}

	// Helper functions for external use
	public getDuckDirection(): string {
		return this.direction;
	}
}
