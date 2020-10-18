import MoveTile from '../sprites/MoveTile'
import Unit from '../sprites/Unit'
import { Team, Grid, Battle, create_simple_tileset } from '../golem'
import { WALL_TILE_INDEXES } from '../constants'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  create() {
    this.clearMoveTiles = this.clearMoveTiles.bind(this)
    this.renderMoveArrow = this.renderMoveArrow.bind(this)
    this.map = this.make.tilemap({ key: 'map' })
    this.tileset = this.map.addTilesetImage('tilemap')
    this.layer = this.map.createDynamicLayer('World', this.tileset, 0, 0)
    this.layer.setAlpha(0.6)
    this.objLayer = this.map.getObjectLayer('Objects')

    this.heroTeam = new Team()
    this.enemyTeam = new Team({ hostile: [this.heroTeam] })

    const tiles = create_simple_tileset(50).map((row, y) =>
      row.map((tile, x) => {
        const sourceTile = this.layer.layer.data[y][x]
        const isWall = WALL_TILE_INDEXES.includes(sourceTile.index)
        tile.cost = isWall ? () => Infinity : () => 1
        return tile
      }),
    )

    this.grid = new Grid({ tiles })

    this.battle = new Battle(this.grid)

    this.objectGroup = this.add.group()
    this.moveTileGroup = this.add.group()
    this.arrowGraphics = this.add.graphics().setDepth(2)
    this.objLayer.objects.forEach((object) => {
      if (object.type === 'unit') {
        this.objectGroup.add(new Unit(this, object), true)
      }
    })

    this.battle.advance()

    this.cameras.main.setBounds(0, 0, 500, 500)
    const cursors = this.input.keyboard.createCursorKeys()
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      ...cursors,
      camera: this.cameras.main,
      speed: 0.2,
    })

    this.events.on('unit_selected', (sprite) => {
      const coords = sprite.deployment.reachable_coords()
      coords.forEach(({ x, y }) => {
        const moveTile = new MoveTile(this, x * 10, y * 10)
        this.moveTileGroup.add(moveTile, true)
      })
    })

    this.events.on('unit_deselected', this.clearMoveTiles)
    this.events.on('unit_deselected', this.renderMoveArrow)
    this.events.on('unit_selected', (sprite) => (this.selectedUnit = sprite))
    this.events.on('unit_moved', this.renderMoveArrow)
    this.events.on('unit_moved', () => {
      const activeTeam = this.battle.active_team()
      const units = this.objectGroup
        .getChildren()
        .filter((u) => u.team.id === activeTeam.id)
      if (units.every((u) => !u.canMove)) {
        this.battle.advance()
      }
    })
    this.events.on('move_tile_clicked', this.clearMoveTiles)
    this.events.on('move_tile_hovered', this.renderMoveArrow)
  }

  update(time, delta) {
    this.controls.update(delta)
  }

  clearMoveTiles() {
    this.selectedUnit = null
    this.moveTileGroup.clear(true, true)
  }

  renderMoveArrow(coords) {
    this.arrowGraphics.clear()
    this.arrowGraphics.lineStyle(2, 0xff0000)

    if (!this.selectedUnit) return

    this.selectedUnit.getPath(coords).forEach((point, i, arr) => {
      const nextPoint = arr[i + 1]
      if (!nextPoint) return

      this.arrowGraphics.lineBetween(
        point.x * 10 + 4,
        point.y * 10 + 5,
        nextPoint.x * 10 + 4,
        nextPoint.y * 10 + 5,
      )
    })
  }
}
