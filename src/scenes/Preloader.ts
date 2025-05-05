import Phaser from 'phaser';
import Plane from '../objects/Plane';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload(): void {
    // Create a loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    // Loading text
    const loadingText = this.add
      .text(width / 2, height / 2 - 50, 'Loading...', {
        font: '20px monospace',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    // Progress percentage text
    const percentText = this.add
      .text(width / 2, height / 2 + 70, '0%', {
        font: '18px monospace',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    // Listen for loading progress
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
      percentText.setText(`${parseInt(String(value * 100))}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Add error handling
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('Error loading asset:', file.src);
    });

    // Load duck animation atlases individually
    // Idle animation
    this.load.atlas(
      'duck_idle',
      'assets/duck/idle/duck_idle.png',
      'assets/duck/idle/duck_idle.json'
    );

    // Walk animation
    this.load.atlas(
      'duck_walk',
      'assets/duck/walk/duck_walk.png',
      'assets/duck/walk/duck_walk.json'
    );

    // Jump animation
    this.load.atlas(
      'duck_jump',
      'assets/duck/jump/duck_jump.png',
      'assets/duck/jump/duck_jump.json'
    );

    // Load plane assets
    Plane.COLORS.forEach((color) => {
      const key = `plane_${color}`;
      this.load.image(key, `assets/plane_1/plane_1_${color}.png`);
    });

    // Load background and other game assets
    this.load.image('background', 'assets/skies/sky_day.jpg');
    this.load.image('logo', 'assets/logo.png');
  }

  create(): void {
    // Once loading is complete, transition to the MainMenu scene
    this.scene.start('MainMenu');
  }
}
