import { Boot } from './scenes/Boot';
import Game from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import Preloader from './scenes/Preloader';
import { Game as PhaserGame, Types } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
    min: {
      width: 320,
      height: 240,
    },
    max: {
      width: 1600,
      height: 1200,
    },
    autoRound: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Set to 0 temporarily
      debug: true, // Enable debug to see physics bodies
    },
  },
  input: {
    keyboard: true,
    touch: true, // Enable touch controls for mobile
    gamepad: true, // Enable gamepad support
  },
  scene: [Boot, Preloader, MainMenu, Game, GameOver],
};

// Add resize listener to handle window size changes
window.addEventListener('resize', () => {
  if (game) {
    // This forces the game to recalculate its size
    game.scale.refresh();
  }
});

const game = new PhaserGame(config);
export default game;
