import { TILE_SIZE } from '../constants'

export default class extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x - 1, y - 1, 'tilemap', 58)
    this.setOrigin(0).setInteractive().setAlpha(0.7).setTintFill(0x00ffff)

    this.on('pointerdown', () =>
      scene.events.emit('move_tile_clicked', this.getCoord()),
    )

    this.on('pointermove', () =>
      scene.events.emit('move_tile_hovered', this.getCoord()),
    )
  }

  getCoord = () => ({
    x: (this.x + 1) / TILE_SIZE,
    y: (this.y + 1) / TILE_SIZE,
  })
}
