import UnitSprite from '../sprites/Unit'
import { Team, Grid, Battle } from '../golem'
import { WORLD_SIZE } from '../constants'
import MovementInput from '../utils/MovementInput'
import { createGolemTiles } from '../utils/createGolemTiles'

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

    this.movementInput = new MovementInput(this)
    this.events.on('unit_moved', this.checkTurn)

    this.battle.advance()
  }

  update(time, delta) {
    this.controls.update(delta)
  }

  getActiveUnits = () =>
    this.objectGroup
      .getChildren()
      .filter((u) => u.team.id === this.battle.active_team().id && u.canMove)

  checkTurn = () => {
    if (this.getActiveUnits().length === 0) {
      this.battle.advance()
    }
  }
}