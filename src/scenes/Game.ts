import Phaser from 'phaser';
import Duck from '../objects/Duck';

export default class Game extends Phaser.Scene {
	private duck!: Duck;

	constructor() {
		super('Game');
	}

	preload(): void {}

	create(): void {
		// Add background (assuming it was loaded in Preloader)
		this.add
			.image(0, 0, 'background')
			.setOrigin(0, 0)
			.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

		// Create the duck instance in the middle of the screen
		this.duck = new Duck(
			this,
			this.cameras.main.width / 2,
			this.cameras.main.height / 2
		);

		// Setup camera to follow the duck
		this.cameras.main.startFollow(this.duck, true, 0.08, 0.08);
		this.cameras.main.setZoom(1.5);

		/* Commented out until platform assets are available
        // Example: Add some platforms for the duck to jump on
        const platforms = this.physics.add.staticGroup();
        for (let i = 0; i < 5; i++) {
            platforms.create(
                Phaser.Math.Between(100, this.cameras.main.width - 100),
                Phaser.Math.Between(100, this.cameras.main.height - 100),
                'platform'
            );
        }
        
        // Add collision between duck and platforms
        this.physics.add.collider(this.duck, platforms);
        */
	}

	update(): void {
		// Update duck logic
		this.duck.update();

		// Additional game logic, collision checks, etc.

		// Example: Check if duck has fallen off the screen
		if (this.duck.y > this.cameras.main.height) {
			this.scene.start('GameOver');
		}
	}
}
