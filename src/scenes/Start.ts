// Start scene for the game

/* START OF COMPILED CODE */

import BackgroundPrefab from '../prefabs/BackgroundPrefab';
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Start extends Phaser.Scene {
	constructor() {
		super('Start');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	private canStart = false;

	create() {
		// Add the same background as the game
		const backgroundPrefab = new BackgroundPrefab(this, 135, 0);
		this.add.existing(backgroundPrefab);

		// Add the logo with smaller scale
		const logo = this.add.image(640, 300, 'logo');
		logo.setScale(0.1); // Make it smaller

		// Add start text
		const startText = this.add.text(
			640,
			500,
			'Press any key or click to start',
			{
				fontSize: '32px',
				color: '#ffffff',
				fontFamily: 'Arial',
				stroke: '#000000',
				strokeThickness: 4,
			}
		);
		startText.setOrigin(0.5);

		// Animate the start text with a pulsing effect
		this.tweens.add({
			targets: startText,
			alpha: 0.5,
			duration: 800,
			ease: 'Sine.inOut',
			yoyo: true,
			repeat: -1,
		});

		// Add a subtle floating animation to the logo
		this.tweens.add({
			targets: logo,
			y: logo.y - 10,
			duration: 2000,
			ease: 'Sine.inOut',
			yoyo: true,
			repeat: -1,
		});

		// Enable start after a short delay to prevent accidental starts
		this.time.delayedCall(500, () => {
			this.canStart = true;

			// Add keyboard listener for any key
			this.input.keyboard!.on('keydown', this.startGame, this);

			// Add click/touch listener
			this.input.on('pointerdown', this.startGame, this);
		});
	}

	private startGame = () => {
		if (!this.canStart) return;

		// Remove event listeners
		this.input.keyboard!.off('keydown', this.startGame, this);
		this.input.off('pointerdown', this.startGame, this);

		// Add a fade out transition
		this.cameras.main.fadeOut(500, 0, 0, 0);

		this.cameras.main.once(
			Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
			() => {
				// Start the main game scene
				this.scene.start('Level');
			}
		);
	};

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
