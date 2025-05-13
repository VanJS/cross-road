import Phaser from 'phaser';
import Duck from '../objects/Duck';
import Plane from '../objects/Plane';
import PlaneManager from '../objects/PlaneManager';
import Cloud from '../objects/Cloud';
import CameraController from '../utils/CameraController';
import ScoreManager from '../utils/ScoreManager';

export default class Game extends Phaser.Scene {
	private duck!: Duck;
	private planeManager!: PlaneManager;
	private clouds!: Cloud[];
	private cameraController!: CameraController;
	private scoreManager!: ScoreManager;
	private scoreText!: Phaser.GameObjects.Text;


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

		for (let i = 0; i < 3; i++) {
			const randomIndex = Phaser.Math.Between(1, 3);
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

		// Set up plane manager with planes
		this.planeManager = new PlaneManager(this, this.duck, this.clouds.map(c => c.x));

		console.log('Plane manager created');

		this.cameraController = new CameraController(this.cameras.main,0.5);

		// Set up score manager
		this.scoreManager = new ScoreManager(this.duck.y);

		// Create score text
		this.scoreText = this.add.text(10, 10, 'Score: 0', {
			fontSize: '24px',
			color: '#ffffff',
			stroke: '#000',
			strokeThickness: 2,
		}).setScrollFactor(0);

	}

	update(): void {
		// Update clouds
		this.clouds.forEach((cloud) => cloud.update?.());

		// Update duck logic
		this.duck.update();

		// Update plane manager
		this.planeManager.update();

		// Update camera controller
		this.cameraController.update();

		// Update score based on duck's Y
		this.scoreManager.update(this.duck.y);

		// Update score display
		this.scoreText.setText(`Score: ${this.scoreManager.getScore()}`);


		// Game over if duck goes off screen (top or bottom)
		const camTop = this.cameras.main.scrollY;
		const camBottom = this.cameras.main.scrollY + this.cameras.main.height;
		const finalScore = this.scoreManager.getScore();
		if (this.duck.y > camBottom || this.duck.y < camTop) {
			this.scene.stop();
			this.scene.start('GameOver', { score: finalScore });
		}

	}
}
