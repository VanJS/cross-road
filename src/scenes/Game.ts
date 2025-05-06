import Phaser from 'phaser';
import Duck from '../objects/Duck';
import Plane from '../objects/Plane';
import PlaneManager from '../objects/PlaneManager';

export default class Game extends Phaser.Scene {
	private duck!: Duck;
	private planeManager!: PlaneManager;
	private backgroundMusic!: Phaser.Sound.BaseSound;

	constructor() {
		super('Game');
	}

	preload(): void {
		// Load planes assets
		Plane.preloadAssets(this);
	}

	create(): void {
		console.log('Game scene create() method called');

		// Setup background music properly
		this.setupBackgroundMusic();

		// Add background
		this.add
			.image(0, 0, 'background')
			.setOrigin(0, 0)
			.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

		console.log('Background added');

		// Create the duck instance in the middle of the screen
		try {
			this.duck = new Duck(
				this,
				this.cameras.main.width / 2,
				this.cameras.main.height / 2
			);
			console.log('Duck created successfully');
		} catch (error) {
			console.error('Error creating duck:', error);
		}

		// Setup camera to follow the duck with fixed zoom
		this.cameras.main.startFollow(this.duck, true, 0.08, 0.08);

		// Set up plane manager with planes
		this.planeManager = new PlaneManager(this, this.duck);

		console.log('Plane manager created');

		// Add mute button
		this.createMuteButton();

		// Setup scene cleanup events
		this.events.on('shutdown', this.cleanupScene, this);
		this.events.on('destroy', this.cleanupScene, this);
	}

	private setupBackgroundMusic(): void {
		// Check if music is already playing from MainMenu scene
		const existingMusic = this.sound.get('main-theme');

		if (existingMusic) {
			// Use the existing music instance
			this.backgroundMusic = existingMusic;

			// If the music was stopped for some reason, restart it
			if (!this.backgroundMusic.isPlaying) {
				this.backgroundMusic.play();
			}
		} else {
			// If no existing music, create and play it
			this.backgroundMusic = this.sound.add('main-theme', {
				volume: 0.4,
				loop: true,
			});

			this.backgroundMusic.play();
		}

		// We don't need to stop the music on shutdown anymore
		// as we want it to continue between scenes
	}

	private createMuteButton(): void {
		// Create a mute button at the desired position
		const muteButton = this.add
			.text(
				10, // X position (left side of screen)
				20, // Y position (20 pixels from top)
				'🔊 Music',
				{
					fontSize: '16px',
					color: '#fff',
					backgroundColor: '#00000080',
					padding: { x: 5, y: 5 },
				}
			)
			.setScrollFactor(0)
			.setInteractive({ useHandCursor: true });

		// Set initial state based on sound system
		if (this.sound.mute) {
			muteButton.setText('🔇 Music');
		}

		// Toggle sound on click/tap
		muteButton.on('pointerdown', () => {
			if (this.sound.mute) {
				this.sound.mute = false;
				muteButton.setText('🔊 Music');
			} else {
				this.sound.mute = true;
				muteButton.setText('🔇 Music');
			}
		});
	}

	// Cleanup all scene resources
	private cleanupScene(): void {
		// Stop duck sounds
		if (this.duck) {
			this.duck.stopSounds();
		}

		// Destroy plane manager
		if (this.planeManager) {
			this.planeManager.destroy();
		}

		// Note: We intentionally don't stop the background music
		// as we want it to continue between scenes
	}

	update(): void {
		// Update duck logic
		this.duck.update();

		// Update plane manager
		this.planeManager.update();

		// Example: Check if duck has fallen off the screen
		if (this.duck.y > this.cameras.main.height) {
			this.scene.start('GameOver');
		}
	}
}
