import Phaser from 'phaser';

export default class Duck extends Phaser.Physics.Arcade.Sprite {
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	private jumpKey: Phaser.Input.Keyboard.Key;
	private isJumping: boolean = false;
	private direction: 'left' | 'right' = 'right';

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
		this.jumpKey =
			scene.input.keyboard?.addKey(
				Phaser.Input.Keyboard.KeyCodes.SPACE
			) || ({} as Phaser.Input.Keyboard.Key);

		// Start with idle animation
		this.play('duck_idle');
	}

	private createAnimations(): void {
		// Create idle animation
		if (!this.scene.anims.exists('duck_idle')) {
			this.scene.anims.create({
				key: 'duck_idle',
				frames: this.scene.anims.generateFrameNames('duck_idle', {
					prefix: 'duckee_idle',
					start: 1,
					end: 4,
					suffix: '.png',
				}),
				frameRate: 8,
				repeat: -1,
			});
		}

		// Create walk animation
		if (!this.scene.anims.exists('duck_walk')) {
			this.scene.anims.create({
				key: 'duck_walk',
				frames: this.scene.anims.generateFrameNames('duck_walk', {
					prefix: 'duckee_walk_run',
					start: 1,
					end: 4,
					suffix: '.png',
				}),
				frameRate: 10,
				repeat: -1,
			});
		}

		// Create jump animation
		if (!this.scene.anims.exists('duck_jump')) {
			this.scene.anims.create({
				key: 'duck_jump',
				frames: this.scene.anims.generateFrameNames('duck_jump', {
					prefix: 'duckee_jump',
					start: 1,
					end: 6,
					suffix: '.png',
				}),
				frameRate: 12,
				repeat: 0,
			});

			// Listen for animation complete event
			this.on('animationcomplete-duck_jump', () => {
				this.isJumping = false;
				this.play('duck_idle');
			});
		}
	}

	update(): void {
		if (this.isJumping) {
			// Skip input handling while jumping
			return;
		}

		// Handle horizontal movement
		if (this.cursors.left?.isDown) {
			this.direction = 'left';
			this.setFlipX(true);
			this.setVelocityX(-150);

			if (!this.isJumping) {
				this.play('duck_walk', true);
			}
		} else if (this.cursors.right?.isDown) {
			this.direction = 'right';
			this.setFlipX(false);
			this.setVelocityX(150);

			if (!this.isJumping) {
				this.play('duck_walk', true);
			}
		} else {
			this.setVelocityX(0);

			if (!this.isJumping) {
				this.play('duck_idle', true);
			}
		}

		// Handle jump input
		if (this.jumpKey && Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
			this.jump();
		}
	}

	private jump(): void {
		if (this.isJumping) return;

		this.isJumping = true;
		this.play('duck_jump');

		// Stop any horizontal movement during jump
		this.setVelocityX(0);

		// Only vertical movement - jump straight up and down
		this.scene.tweens.add({
			targets: this,
			y: this.y - 50, // Jump height
			duration: 300,
			ease: 'Power1',
			yoyo: true, // Come back down
			onComplete: () => {
				// Extra safeguard in case animation complete doesn't fire
				if (this.isJumping) {
					this.isJumping = false;
					this.play('duck_idle');
				}
			},
		});
	}

	// Helper functions for external use
	public isDuckJumping(): boolean {
		return this.isJumping;
	}

	public getDuckDirection(): string {
		return this.direction;
	}
}
