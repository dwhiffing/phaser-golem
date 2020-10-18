import { TILE_SIZE as ts } from '../constants'

export default class {
  constructor(scene) {
    this.scene = scene
    this.arrow = this.scene.add.graphics().setDepth(2)

    this.scene.events.on('unit_moved', this.render)
    this.scene.events.on('move_tile_hovered', this.render)

    this.scene.events.on('unit_selected', (sprite) => {
      this.selectedUnit = sprite
      this.render(sprite)
    })

    this.scene.events.on('unit_deselected', () => {
      this.selectedUnit = null
      this.render()
    })
  }

  render = (coords) => {
    this.arrow.clear().lineStyle(2, 0xff0000)

    if (!this.selectedUnit || !coords) return

    this.selectedUnit.getPath(coords).forEach(({ x, y }, i, arr) => {
      if (!arr[i + 1]) return

      const { x: x2, y: y2 } = arr[i + 1]
      this.arrow.lineBetween(x * ts + 4, y * ts + 5, x2 * ts + 4, y2 * ts + 5)
    })
  }
}
