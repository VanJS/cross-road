import Phaser from 'phaser';

export default class Duck extends Phaser.Physics.Arcade.Sprite {
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	private gamepad: Phaser.Input.Gamepad.Gamepad | null = null;
	private direction: 'left' | 'right' = 'right';
	private moveSpeed: number = 150;
	private animationTypes = ['duck_idle', 'duck_walk'];
	private scaleSize: number = 1.5; // Scale factor for the duck size

	// Sound properties
	private walkSound: Phaser.Sound.BaseSound;
	private stepTimer: Phaser.Time.TimerEvent | null = null;
	private stepInterval: number = 300; // Milliseconds between steps (adjust this value to change interval length)
	private canPlayStepSound: boolean = true;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		// Initialize with the idle animation texture
		super(scene, x, y, 'duck_idle');
		// Add sprite to the scene
		scene.add.existing(this);
		// Enable physics
		scene.physics.add.existing(this);
		// Set physics properties
		this.setCollideWorldBounds(true);
		// Make duck larger by setting scale (1.5 = 150% of original size)
		this.setScale(this.scaleSize);

		// Set up walk sound (no loop because we'll control playing manually)
		this.walkSound = scene.sound.add('walk', {
			volume: 0.4,
			loop: false,
			rate: 1.2, // Slightly faster playback
		});

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

		// Track if duck is moving this frame
		let isMovingThisFrame = false;

		// Handle movement based on movement state
		switch (movementState) {
			case 'left':
				this.direction = 'left';
				this.setFlipX(true);
				this.setVelocityX(-this.moveSpeed);
				this.play('duck_walk', true);
				isMovingThisFrame = true;
				break;
			case 'right':
				this.direction = 'right';
				this.setFlipX(false);
				this.setVelocityX(this.moveSpeed);
				this.play('duck_walk', true);
				isMovingThisFrame = true;
				break;
			case 'up':
				this.setVelocityY(-this.moveSpeed);
				this.play('duck_walk', true);
				isMovingThisFrame = true;
				break;
			case 'down':
				this.setVelocityY(this.moveSpeed);
				this.play('duck_walk', true);
				isMovingThisFrame = true;
				break;
			case 'upLeft':
				this.direction = 'left';
				this.setFlipX(true);
				this.setVelocity(
					-this.moveSpeed / Math.sqrt(2),
					-this.moveSpeed / Math.sqrt(2)
				);
				this.play('duck_walk', true);
				isMovingThisFrame = true;
				break;
			case 'upRight':
				this.direction = 'right';
				this.setFlipX(false);
				this.setVelocity(
					this.moveSpeed / Math.sqrt(2),
					-this.moveSpeed / Math.sqrt(2)
				);
				this.play('duck_walk', true);
				isMovingThisFrame = true;
				break;
			case 'downLeft':
				this.direction = 'left';
				this.setFlipX(true);
				this.setVelocity(
					-this.moveSpeed / Math.sqrt(2),
					this.moveSpeed / Math.sqrt(2)
				);
				this.play('duck_walk', true);
				isMovingThisFrame = true;
				break;
			case 'downRight':
				this.direction = 'right';
				this.setFlipX(false);
				this.setVelocity(
					this.moveSpeed / Math.sqrt(2),
					this.moveSpeed / Math.sqrt(2)
				);
				this.play('duck_walk', true);
				isMovingThisFrame = true;
				break;
			case 'idle':
			default:
				this.play('duck_idle', true);
				isMovingThisFrame = false;
				break;
		}

		// Manage walk sound based on movement
		this.updateWalkSound(isMovingThisFrame);
	}

	// Manage walk sound playback with intervals
	private updateWalkSound(isMoving: boolean): void {
		// If the duck is moving and we can play a step sound
		if (isMoving && this.canPlayStepSound) {
			// Play the step sound
			this.walkSound.play();

			// Set flag to prevent sound playing again immediately
			this.canPlayStepSound = false;

			// Create a timer to allow the next step sound after the interval
			this.stepTimer = this.scene.time.addEvent({
				delay: this.stepInterval,
				callback: () => {
					this.canPlayStepSound = true;
				},
				callbackScope: this,
			});
		}
		// If duck stops moving, clear the step timer
		else if (!isMoving && this.stepTimer) {
			this.stepTimer.destroy();
			this.stepTimer = null;
			this.canPlayStepSound = true;
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

	// Stop all sounds (for cleanup)
	public stopSounds(): void {
		if (this.walkSound) {
			this.walkSound.stop();
		}

		if (this.stepTimer) {
			this.stepTimer.destroy();
			this.stepTimer = null;
		}

		this.canPlayStepSound = true;
	}

	// Handle scene shutdown/cleanup
	public destroy(fromScene?: boolean): void {
		// Stop sounds before destroying
		this.stopSounds();

		// Call parent destroy method
		super.destroy(fromScene);
	}

	// Helper functions for external use
	public getDuckDirection(): string {
		return this.direction;
	}
}
