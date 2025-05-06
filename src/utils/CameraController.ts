export default class CameraController {
	private camera: Phaser.Cameras.Scene2D.Camera;
	private scrollSpeed: number;

	constructor(camera: Phaser.Cameras.Scene2D.Camera, scrollSpeed: number) {
		this.camera = camera;
		this.scrollSpeed = scrollSpeed;
	}

	update(): void {
		this.camera.scrollY -= this.scrollSpeed;
	}
}
