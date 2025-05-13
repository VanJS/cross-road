import Phaser from 'phaser';

export default class ScoreManager {
	private score: number = 0;
	private highestY: number;

	constructor(initialY: number) {
		this.highestY = initialY;
	}

	update(currentY: number): void {
		// In Phaser, upward is decreasing Y, so lower Y = higher position
		if (currentY < this.highestY) {
			const diff = Math.floor(this.highestY - currentY);
			this.score += diff;
			this.highestY = currentY;
		}
	}

	getScore(): number {
		return this.score;
	}
}
