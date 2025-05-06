import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
	background: GameObjects.Image;
	logo: GameObjects.Image;
	title: GameObjects.Text;
	backgroundMusic: Phaser.Sound.BaseSound;

	constructor() {
		super('MainMenu');
	}

	create() {
		// Play background music if not already playing
		this.setupBackgroundMusic();

		this.background = this.add.image(512, 384, 'background');

		// Try to use logo if available, otherwise use text
		try {
			this.logo = this.add.image(512, 300, 'logo');
		} catch (error) {
			// Create a title instead if logo isn't available
			this.add
				.text(512, 300, 'DUCK GAME', {
					fontFamily: 'Arial Black',
					fontSize: 48,
					color: '#ffffff',
					stroke: '#000000',
					strokeThickness: 8,
					align: 'center',
				})
				.setOrigin(0.5);
		}

		this.title = this.add
			.text(512, 460, 'Main Menu', {
				fontFamily: 'Arial Black',
				fontSize: 38,
				color: '#ffffff',
				stroke: '#000000',
				strokeThickness: 8,
				align: 'center',
			})
			.setOrigin(0.5);

		// Add start game text
		this.add
			.text(512, 520, 'Click/Tap to Start', {
				fontFamily: 'Arial',
				fontSize: 24,
				color: '#ffffff',
				stroke: '#000000',
				strokeThickness: 4,
				align: 'center',
			})
			.setOrigin(0.5);

		// Add mute button in the corner
		this.createMuteButton();

		this.input.once('pointerdown', () => {
			// Don't stop music when moving to game scene - it will continue playing
			this.scene.start('Game');
		});
	}

	private setupBackgroundMusic(): void {
		// Check if the music is already playing in the sound manager
		if (!this.sound.get('main-theme')) {
			// Create and play the music if it doesn't exist
			this.backgroundMusic = this.sound.add('main-theme', {
				volume: 0.35,
				loop: true,
			});

			this.backgroundMusic.play();
		}
	}
	private createMuteButton(): void {
		// Create a mute button at the same position as in Game.ts
		const muteButton = this.add
			.text(
				10, // X position (left side of screen)
				20, // Y position (50 pixels from top)
				'🔊 Music',
				{
					fontSize: '16px',
					color: '#fff',
					backgroundColor: '#00000080',
					padding: { x: 5, y: 5 },
				}
			)
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
}
