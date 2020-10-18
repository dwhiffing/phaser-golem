import { Unit } from '../golem'

// TODO: clean up events on destroy

export default class extends Phaser.GameObjects.Sprite {
  constructor(scene, unit) {
    let { x, y } = unit
    // tiled offset
    y -= 10

    super(scene, x, y, 'people', 1)
    this.setOrigin(0)
    this.setInteractive()
    this.move = this.move.bind(this)
    this.select = this.select.bind(this)
    this.deselect = this.deselect.bind(this)
    this.getPath = this.getPath.bind(this)
    this.unit = unit
    this.coordinate = { x: Math.floor(x / 10), y: Math.floor(y / 10) }
    this.team = unit.name === 'hero' ? scene.heroTeam : scene.enemyTeam

    if (unit.name === 'hero') {
      this.setTintFill(0x0000ff)
    } else {
      this.setTintFill(0xff0000)
    }

    const activeTeam = scene.battle.active_team()
    this.alpha = !activeTeam || this.team.id === activeTeam.id ? 1 : 0.4
    this.scene.battle.events.on('nextTurn', (team) => {
      if (this.team.id === team.id) {
        this.setAlpha(1)
        this.canMove = true
      }
      this.setAlpha(this.team.id === team.id ? 1 : 0.4)
    })

    this.deployment = scene.grid.deploy_unit(
      new Unit({
        team: this.team,
        movement: {
          steps: 5,
          unit_pass_through_limit: 0,
          can_pass_through_other_unit: false,
        },
      }),
      this.coordinate,
    )

    this.on('pointerdown', () => {
      if (this.selected) {
        this.deselect()
      } else {
        this.select()
      }
    })

    this.scene.events.on('move_tile_clicked', (coord) => {
      if (this.selected) {
        this.move(coord)
        this.deselect()
      }
    })

    this.scene.events.on('unit_selected', this.deselect)
  }

  create() {}

  deselect(sprite) {
    if (sprite === this) return
    this.selected = false
    this.scene.events.emit('unit_deselected')
  }

  select() {
    if (this.scene.battle.active_team().id === this.team.id && this.canMove) {
      this.selected = true
      this.scene.events.emit('unit_selected', this)
    }
  }

  move(coord) {
    const timeline = this.scene.tweens.createTimeline()
    this.getPath(coord).forEach(({ x, y }) =>
      timeline.add({ targets: this, x: x * 10, y: y * 10, duration: 75 }),
    )
    timeline.play()
    timeline.on('complete', () => {
      this.scene.events.emit('unit_moved', this)
      this.setAlpha(0.4)
    })

    this.canMove = false
    this.coordinate = coord
    this.deployment.move([coord])
  }

  getPath(coords) {
    return [this.coordinate, ...this.deployment.get_route({ to: coords })]
  }

  update(time, delta) {}
}
