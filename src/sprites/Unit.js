import * as GolemClasses from 'golem'

export default class extends Phaser.GameObjects.Sprite {
  constructor(scene, unit) {
    const { x, y } = unit
    super(scene, x, y, 'people', 1)
    this.setOrigin(0)
    this.setInteractive()
    this.move = this.move.bind(this)
    this.unit = unit

    this.deployment = scene.golem.grid.deploy_unit(
      new GolemClasses.Unit({
        team: scene.golem.heroTeam,
        movement: { steps: 5 },
      }),
      { x: Math.floor(x / 10), y: Math.floor(y / 10) },
    )

    this.on('pointerdown', () => {
      this.toggleSelect()
    })

    this.scene.events.on('move_tile_clicked', (coord) => {
      this.move(coord)
      this.toggleSelect()
    })
  }

  create() {}

  toggleSelect() {
    if (this.selected) {
      this.clearTint()
    } else {
      this.setTintFill(0xff0000)
    }
    this.selected = !this.selected
    if (this.selected) {
      this.scene.events.emit('unit_selected', this)
    } else {
      this.scene.events.emit('unit_deselected')
    }
  }

  move(coord) {
    this.deployment.move([coord])
    this.setPosition(coord.x * 10, coord.y * 10)
  }

  update(time, delta) {}
}
