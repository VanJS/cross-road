import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create(data: { score: number }) {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xff0000);
    
        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);
    
        this.gameover_text = this.add.text(512, 300, 'Game Over', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
        });
        this.gameover_text.setOrigin(0.5);
    
        // Show final score
        const scoreText = this.add.text(512, 380, `Your Score: ${data.score}`, {
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        });
        scoreText.setOrigin(0.5);
    
        const prompt = this.add.text(512, 460, 'Click to Restart', {
            fontSize: '24px',
            color: '#ffffff',
        });
        prompt.setOrigin(0.5);
    
        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }    
}
