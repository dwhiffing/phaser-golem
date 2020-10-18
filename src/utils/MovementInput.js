import MoveTile from '../sprites/MoveTile'
import { TILE_SIZE as ts } from '../constants'

export default class {
  constructor(scene) {
    this.scene = scene
    this.moveTileGroup = this.scene.add.group()
    this.arrow = this.scene.add.graphics().setDepth(2)

    this.scene.events.on('move_tile_clicked', this.clearMoveTiles)
    this.scene.events.on('unit_moved', this.renderMoveArrow)
    this.scene.events.on('move_tile_hovered', this.renderMoveArrow)

    this.scene.events.on('unit_selected', (sprite) => {
      this.selectedUnit = sprite
      this.renderMoveArrow(sprite)
      this.renderMoveTiles(sprite)
    })

    this.scene.events.on('unit_deselected', () => {
      this.selectedUnit = null
      this.clearMoveTiles()
      this.renderMoveArrow()
    })
  }

  renderMoveTiles = (sprite) => {
    sprite.deployment.reachable_coords().forEach(({ x, y }) => {
      this.moveTileGroup.add(new MoveTile(this.scene, x * ts, y * ts), true)
    })
  }

  clearMoveTiles = () => this.moveTileGroup.clear(true, true)

  renderMoveArrow = (coords) => {
    this.arrow.clear().lineStyle(2, 0xff0000)

    if (!this.selectedUnit || !coords) return

    this.selectedUnit.getPath(coords).forEach(({ x, y }, i, arr) => {
      if (!arr[i + 1]) return

      const { x: x2, y: y2 } = arr[i + 1]
      this.arrow.lineBetween(x * ts + 4, y * ts + 5, x2 * ts + 4, y2 * ts + 5)
    })
  }
}
