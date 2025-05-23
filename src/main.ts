import Phaser from 'phaser';
import Level from './scenes/Level';
import Preload from './scenes/Preload';
import Start from './scenes/Start';

class Boot extends Phaser.Scene {
	constructor() {
		super('Boot');
	}
}

window.addEventListener('load', function () {
	const game = new Phaser.Game({
		width: 1280,
		height: 720,
		backgroundColor: '#2f2f2f',
		parent: 'game-container',
		scale: {
			mode: Phaser.Scale.ScaleModes.FIT,
			autoCenter: Phaser.Scale.Center.CENTER_BOTH,
		},
		pixelArt: true,
		physics: {
			default: 'arcade',
			arcade: {
				gravity: {
					x: 0,
					y: 300,
				},
				debug: false,
			},
		},
	});

	game.scene.add('Level', Level);
	game.scene.add('Start', Start);
	game.scene.add('Preload', Preload, true);
});
