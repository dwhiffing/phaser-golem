import * as GolemClasses from 'golem'

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

    this.deployment = scene.golem.grid.deploy_unit(
      new GolemClasses.Unit({
        team: scene.golem.heroTeam,
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
    this.clearTint()
    this.scene.events.emit('unit_deselected')
  }

  select() {
    this.selected = true
    this.setTintFill(0xff0000)
    this.scene.events.emit('unit_selected', this)
  }

  move(coord) {
    const timeline = this.scene.tweens.createTimeline()
    this.getPath(coord).forEach(({ x, y }) =>
      timeline.add({ targets: this, x: x * 10, y: y * 10, duration: 75 }),
    )
    timeline.play()

    this.coordinate = coord
    this.deployment.move([coord])
    this.scene.events.emit('unit_moved', this)
  }

  getPath(coords) {
    return [this.coordinate, ...this.deployment.get_route({ to: coords })]
  }

  update(time, delta) {}
}
