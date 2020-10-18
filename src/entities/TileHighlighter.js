import { TILE_SIZE as ts } from '../constants'

export default class {
  constructor(scene) {
    this.scene = scene
    this.group = this.scene.add.group()
  }

  render = (coords, tint = 0x00ffff) => {
    coords.forEach(({ x, y }) => {
      this.group.add(new Highlight(this.scene, x * ts, y * ts, tint), true)
    })
  }

  clear = () => {
    this.group.clear(true, true)
  }
}

class Highlight extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, tint) {
    super(scene, x - 1, y - 1, 'tilemap', 58)

    this.setOrigin(0).setInteractive().setAlpha(0.7).setTintFill(tint)

    this.on('pointerdown', () =>
      scene.events.emit('move_tile_clicked', this.getCoord()),
    )

    this.on('pointermove', () =>
      scene.events.emit('move_tile_hovered', this.getCoord()),
    )
  }

  getCoord = () => ({ x: (this.x + 1) / ts, y: (this.y + 1) / ts })
}
