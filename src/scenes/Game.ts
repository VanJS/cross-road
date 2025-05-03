import Phaser from 'phaser';
import Duck from '../objects/Duck';
import Plane from '../objects/Plane';
import PlaneManager from '../objects/PlaneManager';
import Cloud from '../objects/Cloud';

export default class Game extends Phaser.Scene {
	private duck!: Duck;
	private planeManager!: PlaneManager;
	private clouds!: Cloud[];

	constructor() {
		super('Game');
	}

	preload(): void {
		// Load planes assets
		Plane.preloadAssets(this);
	}

	create(): void {
		console.log('Game scene create() method called');

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

		// Create clouds
		this.clouds = [];

		for (let i = 0; i < 5; i++) {
			const randomIndex = Phaser.Math.Between(1, 5);
			let x: number;
			let y: number;

			if (i === 0) {
				// Place the first cloud under the duck
				x = this.duck.x;
				y = this.duck.y + 30; // adjust offset as needed
			} else {
				x = Phaser.Math.Between(0, this.cameras.main.width);
				y = Phaser.Math.Between(0, this.cameras.main.height / 2);
			}

			const cloud = new Cloud(this, x, y, `cloud${randomIndex}`);
			this.clouds.push(cloud);
		}

		// Setup camera to follow the duck
		this.cameras.main.startFollow(this.duck, true, 0.08, 0.08);

		// Set up plane manager with planes
		this.planeManager = new PlaneManager(this, this.duck);

		console.log('Plane manager created');
	}

	update(): void {
		// Update clouds
		this.clouds.forEach((cloud) => cloud.update?.());

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
