export default class extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'tilemap', 58)
    this.setOrigin(0)
    this.setInteractive()
    this.setAlpha(0.7)
    this.setTintFill(0x00ffff)
    this.x -= 1
    this.y -= 1

    this.on('pointerdown', () => {
      this.scene.events.emit('move_tile_clicked', {
        x: (this.x + 1) / 10,
        y: (this.y + 1) / 10,
      })
    })
  }

  create() {}

  update(time, delta) {}
}
