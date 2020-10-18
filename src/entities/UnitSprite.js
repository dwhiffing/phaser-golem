import { Coords, Unit } from '../golem'
import { VARIANTS, TILE_SIZE, UNIT_MOVE_DURATION } from '../constants'

export default class extends Phaser.GameObjects.Sprite {
  constructor(scene, unit, variant) {
    super(scene, unit.x, unit.y - TILE_SIZE, 'people', 1)
    this.unit = unit
    this.team = unit.name === 'hero' ? scene.heroTeam : scene.enemyTeam
    this.coordinate = {
      x: Math.floor(unit.x / TILE_SIZE),
      y: Math.floor((unit.y - TILE_SIZE) / TILE_SIZE),
    }

    this.setOrigin(0)
      .setInteractive()
      .setTintFill(unit.name === 'hero' ? 0x0000ff : 0xff0000)

    this.deployment = scene.grid.deploy_unit(
      new Unit({ team: this.team, ...VARIANTS[variant] }),
      this.coordinate,
    )

    this.on('pointerdown', this.onClick)

    this.scene.battle.events.on('nextTurn', this.onStartTurn)

    this.scene.events.on('unit_selected', this.deselect)

    this.scene.events.on('tile_highlight_clicked', this.onClickTileHighlight)
  }

  move = (highlight) => {
    const coord = highlight.getCoord()
    const timeline = this.scene.tweens.createTimeline()
    const path = this.getPath(coord)
    path.forEach(({ x, y }) =>
      timeline.add({
        targets: this,
        x: x * TILE_SIZE,
        y: y * TILE_SIZE,
        duration: UNIT_MOVE_DURATION / path.length,
      }),
    )
    timeline.play()
    timeline.on('complete', () => {
      this.scene.events.emit('unit_moved', this)
      this.scene.events.emit('unit_target_attack', this)
    })

    this.canMove = false
    this.canAttack = false
    this.coordinate = coord
    this.deployment.move([coord])
  }

  select = () => {
    if (this.scene.battle.active_team().id === this.team.id && this.canMove) {
      this.selected = true
      this.scene.events.emit('unit_selected', this)
    }
  }

  deselect = (sprite) => {
    if (sprite === this) return
    this.selected = false
    this.scene.events.emit('unit_deselected')
  }

  onStartTurn = (activeTeam) => {
    if (this.team.id === activeTeam.id) {
      this.setAlpha(1)
      this.canMove = true
    }
    this.setAlpha(this.team.id === activeTeam.id ? 1 : 0.4)
  }

  getPath = (coords) => [
    this.coordinate,
    ...this.deployment.get_route({ to: coords }),
  ]

  onClick = () => (this.selected ? this.deselect() : this.select())

  onClickTileHighlight = (highlight) => {
    if (!this.selected) return

    if (highlight.type === 'move') {
      this.move(highlight)
    } else if (highlight.type === 'attack') {
      this.attack(highlight)
    }
  }

  attack = (highlight) => {
    const coords = highlight.getCoord()
    const reachable = this.deployment.targetable_coords()

    if (reachable.every((p) => !Coords.match(p, coords))) return

    const clickedUnit = this.scene.objectGroup
      .getChildren()
      .find((o) => o.deployment.coordinates.match(coords))

    this.scene.tweens.add({
      targets: this,
      x: coords.x * TILE_SIZE,
      y: coords.y * TILE_SIZE,
      yoyo: true,
      onComplete: () => {
        // this.scene.events.emit('unit_attacked', clickedUnit)
        if (clickedUnit) {
          clickedUnit.destroy()
        }
        this.setAlpha(0.4)
        this.deselect()
      },
      duration: 150,
    })
  }

  destroy = (fromScene) => {
    this.scene.events.off('unit_selected', this.deselect)
    this.scene.events.off('tile_highlight_clicked', this.onClickTileHighlight)
    this.scene.battle.events.off('nextTurn', this.onStartTurn)
    this.scene.grid.withdraw_deployment(this.deployment)
    super.destroy(true)
  }
}
