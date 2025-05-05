import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Make sure this matches your actual background path
    this.load.image('background', 'assets/skies/sky_day.png');

    console.log('Boot scene preload complete');
  }

  create() {
    console.log('Boot scene starting Preloader');
    this.scene.start('Preloader');
  }
}
