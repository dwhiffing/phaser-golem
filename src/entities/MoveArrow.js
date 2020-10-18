import { TILE_SIZE as ts } from '../constants'

export default class {
  constructor(scene) {
    this.scene = scene
    this.arrow = this.scene.add.graphics().setDepth(2)
  }

  render = (coords) => {
    this.clear().lineStyle(2, 0xff0000)

    if (!this.selectedUnit || !coords) return

    this.selectedUnit.getPath(coords).forEach(({ x, y }, i, arr) => {
      if (!arr[i + 1]) return

      const { x: x2, y: y2 } = arr[i + 1]
      this.arrow.lineBetween(x * ts + 4, y * ts + 5, x2 * ts + 4, y2 * ts + 5)
    })
  }

  clear = () => this.arrow.clear()
}
