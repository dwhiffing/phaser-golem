import UnitSprite from '../entities/UnitSprite'
import TileHighlighter from '../entities/TileHighlighter'
import MoveArrow from '../entities/MoveArrow'
import { Team, Grid, Battle } from '../golem'
import { createGolemTiles } from '../utils/createGolemTiles'
import { WORLD_SIZE } from '../constants'

// Undo button
// End turn button
// attack button
export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  create() {
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      ...this.input.keyboard.createCursorKeys(),
      camera: this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE),
      speed: 0.2,
    })

    this.map = this.make.tilemap({ key: 'map' })
    this.tileset = this.map.addTilesetImage('tilemap')
    this.layer = this.map.createDynamicLayer('World', this.tileset, 0, 0)
    this.layer.setAlpha(0.6)

    this.heroTeam = new Team()
    this.enemyTeam = new Team({ hostile: [this.heroTeam] })
    this.grid = new Grid({ tiles: createGolemTiles(this.layer.layer.data) })
    this.battle = new Battle(this.grid)

    this.objectGroup = this.add.group()
    this.map.getObjectLayer('Objects').objects.forEach((object) => {
      if (object.type === 'unit') {
        this.objectGroup.add(new UnitSprite(this, object), true)
      }
    })

    this.moveArrow = new MoveArrow(this)
    this.tileHighlighter = new TileHighlighter(this)

    this.events.on('tile_highlight_hovered', (highlight) =>
      this.moveArrow.render(highlight.getCoord()),
    )

    this.events.on('tile_highlight_clicked', () => {
      this.moveArrow.clear()
      this.tileHighlighter.clear()
    })

    this.events.on('unit_selected', (sprite) => {
      this.moveArrow.selectedUnit = sprite
      this.moveArrow.render(sprite)
      this.tileHighlighter.render(sprite.deployment.reachable_coords(), 'move')
    })

    this.events.on('unit_deselected', () => {
      this.moveArrow.selectedUnit = null
      this.moveArrow.clear()
      this.tileHighlighter.clear()
    })

    this.events.on('unit_moved', () => {
      this.moveArrow.render()
      this.checkTurn()
    })

    this.events.on('unit_target_attack', (sprite) => {
      this.tileHighlighter.render(
        sprite.deployment.targetable_coords(),
        'attack',
      )
    })

    this.battle.advance()
  }

  update(time, delta) {
    this.controls.update(delta)
  }

  getActiveUnits = () =>
    this.objectGroup
      .getChildren()
      .filter(
        (u) =>
          u.team.id === this.battle.active_team().id &&
          (u.canMove || u.canAttack),
      )

  checkTurn = () => {
    if (this.getActiveUnits().length === 0) {
      this.battle.advance()
    }
  }
}
