import Golem from '../golem'
import MoveTile from '../sprites/MoveTile'
import Unit from '../sprites/Unit'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  create() {
    this.clearMoveTiles = this.clearMoveTiles.bind(this)
    this.map = this.make.tilemap({ key: 'map' })
    this.tileset = this.map.addTilesetImage('tilemap')
    this.layer = this.map.createDynamicLayer('World', this.tileset, 0, 0)
    this.objLayer = this.map.getObjectLayer('Objects')
    this.golem = new Golem({ map: this.layer.layer.data })
    this.objectGroup = this.add.group()
    this.moveTileGroup = this.add.group()

    this.objLayer.objects.forEach((unit) => {
      this.objectGroup.add(new Unit(this, unit), true)
    })

    this.cameras.main.setBounds(0, 0, 500, 500)
    const cursors = this.input.keyboard.createCursorKeys()
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      ...cursors,
      camera: this.cameras.main,
      speed: 0.2,
    })

    this.events.on('unit_selected', (sprite) => {
      this.selectedUnit = sprite
      this.moveTileGroup.clear(true)
      const coords = this.selectedUnit.deployment.reachable_coords()
      coords.forEach(({ x, y }) => {
        const moveTile = new MoveTile(this, x * 10, y * 10)
        this.moveTileGroup.add(moveTile, true)
      })
    })

    this.events.on('unit_deselected', this.clearMoveTiles)
    this.events.on('move_tile_clicked', this.clearMoveTiles)

    this.input.on('pointerdown', (pointer) => {
      // this.selectedUnit = this.selectedUnit ? null : this.selectedUnit
    })
  }

  update(time, delta) {
    this.controls.update(delta)
  }

  clearMoveTiles() {
    this.selectedUnit = null
    this.moveTileGroup.clear(true, true)
  }
}
