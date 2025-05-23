// You can write more code here
/* START OF COMPILED CODE */
import BackgroundPrefab from '../prefabs/BackgroundPrefab';
import PlatformGroupPrefab from '../prefabs/PlatformGroupPrefab';
import PlayerPrefab from '../prefabs/PlayerPrefab';
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */
export default class Level extends Phaser.Scene {
	constructor() {
		super('Level');
		/* START-USER-CTR-CODE */
		// Initialization code can go here
		/* END-USER-CTR-CODE */
	}
	editorCreate(): void {
		// leftKeyboardKey
		const leftKeyboardKey = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.LEFT
		);
		// rightKeyboardKey
		const rightKeyboardKey = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.RIGHT
		);
		// backgroundPrefab
		const backgroundPrefab = new BackgroundPrefab(this, 135, 0);
		this.add.existing(backgroundPrefab);
		// platformGroupPrefab
		const platformGroupPrefab = new PlatformGroupPrefab(this);
		this.add.existing(platformGroupPrefab);
		// playerLayer
		const playerLayer = this.add.layer();
		// player
		const player = new PlayerPrefab(this, 640, 467);
		player.body.checkCollision.left = false;
		player.body.checkCollision.right = false;
		playerLayer.add(player);
		// PlayerWithPlatformsCollider
		this.physics.add.collider(
			player,
			platformGroupPrefab.group,
			this.onPlayerLand
		);
		this.platformGroupPrefab = platformGroupPrefab;
		this.player = player;
		this.leftKeyboardKey = leftKeyboardKey;
		this.rightKeyboardKey = rightKeyboardKey;
		this.events.emit('scene-awake');
	}
	private platformGroupPrefab!: PlatformGroupPrefab;
	private player!: PlayerPrefab;
	private leftKeyboardKey!: Phaser.Input.Keyboard.Key;
	private rightKeyboardKey!: Phaser.Input.Keyboard.Key;
	/* START-USER-CODE */
	private firstJumpMade = false;
	private hasLanded = false;
	private isJumping = false; // New flag to track if player is in jump sequence
	isGameOver = false;
	// @ts-ignore - Add properties for audio
	private bgm: Phaser.Sound.BaseSound;
	// @ts-ignore - Add properties for audio
	private walkSfx: Phaser.Sound.BaseSound;

	// Score system properties
	score = 0; // Made public so PlatformGroupPrefab can access it
	private scoreText!: Phaser.GameObjects.Text;
	private startingY = 467; // Player's starting Y position

	// Game over UI elements
	private gameOverText!: Phaser.GameObjects.Text;
	private restartText!: Phaser.GameObjects.Text;
	private canRestart = false;

	private bgTileSprite: any;

	create() {
		this.editorCreate();
		// Play background music on a loop
		this.bgm = this.sound.add('main-theme', { loop: true, volume: 0.2 });
		this.walkSfx = this.sound.add('walk', { volume: 0.3 });
		this.bgm.play();
		this.isGameOver = false;
		// We're not setting bounds anymore since we don't want physical boundaries
		// The player will now wrap around horizontally instead of colliding with boundaries
		// Make the camera follow the player with smoothing and offset settings
		this.cameras.main.startFollow(this.player, false, 0.1, 1, 0, 0.1);
		this.cameras.main.setDeadzone(this.scale.width);
		// Apply a zoom factor to the camera
		this.cameras.main.setZoom(1.3);
		this.firstJumpMade = false;
		this.hasLanded = false;
		this.isJumping = false;

		// Initialize score system
		this.score = 0;
		this.startingY = this.player.y;

		// Create score text that follows the camera
		this.scoreText = this.add.text(900, 100, 'Score: 0', {
			fontSize: '22px',
			color: '#ffffff',
			fontFamily: 'Arial',
			stroke: '#000000',
			strokeThickness: 4,
		});
		this.scoreText.setScrollFactor(0); // Make it stay in place relative to camera
		this.scoreText.setDepth(1000); // Ensure it's always on top

		// Create game over text (hidden initially)
		this.gameOverText = this.add.text(640, 300, 'GAME OVER', {
			fontSize: '64px',
			color: '#ff0000',
			fontFamily: 'Arial',
			stroke: '#000000',
			strokeThickness: 6,
		});
		this.gameOverText.setOrigin(0.5);
		this.gameOverText.setScrollFactor(0);
		this.gameOverText.setDepth(1001);
		this.gameOverText.setVisible(false);

		// Create restart text (hidden initially)
		this.restartText = this.add.text(
			640,
			400,
			'Press any key or click to restart',
			{
				fontSize: '24px',
				color: '#ffffff',
				fontFamily: 'Arial',
				stroke: '#000000',
				strokeThickness: 4,
			}
		);
		this.restartText.setOrigin(0.5);
		this.restartText.setScrollFactor(0);
		this.restartText.setDepth(1001);
		this.restartText.setVisible(false);

		// Reset restart flag
		this.canRestart = false;
	}

	// Callback when the player lands on a platform
	private onPlayerLand = (player: any, platform: any) => {
		// Handle one-time platform logic
		if (platform.onPlayerLand) {
			platform.onPlayerLand();
		}

		// Only process landing if we're not already in a jump sequence
		if (!this.hasLanded && !this.isJumping) {
			this.hasLanded = true;
			this.isJumping = true; // Set jumping flag to prevent multiple triggers
			this.player.play('playerLand');
			this.walkSfx.play();
			this.player.once(
				Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'playerLand',
				() => {
					this.player.play('playerJump');
					this.player.setVelocityY(-400);
					this.firstJumpMade = true;
					this.player.once(
						Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
							'playerJump',
						() => {
							this.player.play('playerSpin');
							// Reset isJumping only after the jump animation is complete
							// and we're entering spin state
							this.isJumping = false;
						}
					);
				}
			);
		}
	};

	private updateScore() {
		// Calculate the distance traveled upward (negative Y direction)
		const heightReached = this.startingY - this.player.y;

		// Only update score if player has gone higher than before
		if (heightReached > this.score) {
			this.score = Math.floor(heightReached);
			this.scoreText.setText(`Score: ${this.score}`);
		}
	}

	private showGameOver() {
		// Show game over UI
		this.gameOverText.setVisible(true);
		this.restartText.setVisible(true);

		// Stop background music
		this.bgm.stop();

		// Enable restart after a short delay
		this.time.delayedCall(1000, () => {
			this.canRestart = true;

			// Add keyboard listener for any key
			this.input.keyboard!.on('keydown', this.restartGame, this);

			// Add click/touch listener
			this.input.on('pointerdown', this.restartGame, this);
		});
	}

	private restartGame = () => {
		if (!this.canRestart) return;

		// Remove event listeners
		this.input.keyboard!.off('keydown', this.restartGame, this);
		this.input.off('pointerdown', this.restartGame, this);

		// Restart the scene
		this.scene.restart();
	};

	update() {
		// Custom horizontal-only wrapping logic with specific boundary values
		const leftBoundary = 320;
		const worldWidth = 620;
		const rightBoundary = leftBoundary + worldWidth;
		const playerWidth = this.player.width;
		// If player goes off the left boundary
		if (this.player.x < leftBoundary - playerWidth / 2) {
			this.player.x = rightBoundary + playerWidth / 2;
		}
		// If player goes off the right boundary
		else if (this.player.x > rightBoundary + playerWidth / 2) {
			this.player.x = leftBoundary - playerWidth / 2;
		}
		// Check if the player is touching down
		const isTouchDown = this.player.body.touching.down;
		// Reset landing flag when player leaves the platform
		if (!isTouchDown) {
			this.hasLanded = false;
		}
		// Horizontal movement control after first jump
		if (
			this.leftKeyboardKey.isDown &&
			!isTouchDown &&
			this.firstJumpMade &&
			!this.isGameOver
		) {
			this.player.setVelocityX(-200);
			this.player.setFlipX(true);
		} else if (
			this.rightKeyboardKey.isDown &&
			!isTouchDown &&
			this.firstJumpMade &&
			!this.isGameOver
		) {
			this.player.setVelocityX(200);
			this.player.setFlipX(false);
		} else {
			// Stop horizontal movement
			this.player.setVelocityX(0);
		}
		if (this.isGameOver) {
			this.player.setVelocityX(0);
			this.player.setVelocityY(50);
			return;
		}
		if (
			this.player.y >
			this.platformGroupPrefab.bottomMostPlatformYposition + 200
		) {
			this.isGameOver = true;
			this.player.play('playerHurt');
			this.player.setVelocityY(50);
			// Add wipe effect
			if (this.player.postFX) {
				const wipeFX = this.player.postFX.addWipe(0.1, 0, 1);
				// Create a tween for the wipe effect
				this.tweens.add({
					targets: wipeFX,
					progress: 1,
					duration: 1500,
					onComplete: () => {
						// Disable physics body when animation completes
						this.player.body.enable = false;
						// Show game over UI
						this.showGameOver();
					},
				});
			}
			return;
		}

		// Update score based on player's highest position
		this.updateScore();

		// Update platform group with current score for speed scaling
		this.platformGroupPrefab.updateWithScore(this.score);

		// Use the directly stored tile sprite reference to update the background
		if (
			this.bgTileSprite &&
			this.bgTileSprite.tilePositionY !== undefined
		) {
			this.bgTileSprite.tilePositionY = this.player.y * 0.5;
		}
	}
	/* END-USER-CODE */
}
/* END OF COMPILED CODE */
// You can write more code here
