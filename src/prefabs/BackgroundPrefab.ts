// You can write more code here
import * as Phaser from 'phaser';

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class BackgroundPrefab extends Phaser.GameObjects.Container {
	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 458, y ?? 144);

		// tilesprite_1
		const tilesprite_1 = scene.add.tileSprite(0, 0, 1024, 768, 'sky_day');
		tilesprite_1.setOrigin(0, 0);
		tilesprite_1.tintTopLeft = 16777215;
		tilesprite_1.tintTopRight = 16777215;
		tilesprite_1.tintBottomLeft = 16777215;
		tilesprite_1.tintBottomRight = 16777215;
		this.add(tilesprite_1);

		/* START-USER-CTR-CODE */
		this.setScrollFactor(0);

		// Also apply scrollFactor to all children for consistency
		this.each((child: Phaser.GameObjects.GameObject) => {
			if ('setScrollFactor' in child) {
				(child as any).setScrollFactor(0);
			}
		});
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	// Update the tile position for infinite scrolling
	updateTilePosition(cameraX: number, cameraY: number): void {
		// Get the first child which should be our tileSprite
		const tileSprite = this.getAt(0) as Phaser.GameObjects.TileSprite;

		// Update the tilePosition to create infinite scrolling effect
		if (
			tileSprite &&
			'tilePositionX' in tileSprite &&
			'tilePositionY' in tileSprite
		) {
			// Move the tile position based on camera movement with parallax factor
			tileSprite.tilePositionX = cameraX * 0.3; // Horizontal parallax
			tileSprite.tilePositionY = cameraY * 0.3; // Vertical parallax
		}
	}

	// Legacy method for compatibility
	setTilePositionY(value: number): void {
		// Get the first child which should be our tileSprite
		const tileSprite = this.getAt(0) as Phaser.GameObjects.TileSprite;

		// Update the tilePositionY if the tileSprite exists
		if (tileSprite && 'tilePositionY' in tileSprite) {
			tileSprite.tilePositionY = value;
		}
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */
// You can write more code here
