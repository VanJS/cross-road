import Phaser from 'phaser';

export default class ScoreManager {
	private scene: Phaser.Scene;
	private score: number = 0;
	private scoreText: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;

		this.scoreText = this.scene.add.text(16, 16, 'Score: 0', {
			fontSize: '24px',
			color: '#fff',
			backgroundColor: 'rgba(0,0,0,0.3)',
			padding: { x: 8, y: 4 },
		}).setScrollFactor(0); // Keep text on screen
	}

	public updateScoreByDistance(distance: number): void {
		const newScore = Math.floor(distance / 10);
		if (newScore > this.score) {
			this.score = newScore;
			this.scoreText.setText(`Score: ${this.score}`);
		}
	}

	public getScore(): number {
		return this.score;
	}
}
