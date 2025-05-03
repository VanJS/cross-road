export default class Cloud extends Phaser.GameObjects.Image {
	private isStatic: boolean;

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, isStatic = true) {
		super(scene, x, y, texture);
		scene.add.existing(this);
		this.setDepth(0);

		this.isStatic = isStatic;
	}

	update(): void {
		// If static, do nothing (cloud doesn't move)
	}
}
