import { TILE_SIZE as ts } from '../constants'

export default class {
  constructor(scene) {
    this.scene = scene
    this.group = this.scene.add.group()
  }

  render = (coords, type) => {
    this.clear()

    let tint = 0x00ffff
    if (type === 'attack') tint = 0xff0000
    coords.forEach(({ x, y }) => {
      this.group.add(
        new Highlight(this.scene, x * ts, y * ts, type, tint),
        true,
      )
    })
  }

  clear = () => {
    this.group.clear(true, true)
  }
}

class Highlight extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, type, tint) {
    super(scene, x, y, 'tilemap', 58)

    this.setOrigin(0).setInteractive().setAlpha(0.7).setTintFill(tint)
    this.type = type
    this.tile = scene.grid.tile_at(this.getCoord())

    this.on('pointerdown', () =>
      scene.events.emit('tile_highlight_clicked', this),
    )

    this.on('pointermove', () =>
      scene.events.emit('tile_highlight_hovered', this),
    )
  }

  getCoord = () => ({ x: this.x / ts, y: this.y / ts })
}
