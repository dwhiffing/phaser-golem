export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload() {
    const progress = this.add.graphics()
    this.load.on('progress', (value) => {
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(
        0,
        0,
        this.sys.game.config.width * value,
        this.sys.game.config.height,
      )
    })

    this.load.bitmapFont(
      'pixel-dan',
      'assets/pixel-dan.png',
      'assets/pixel-dan.xml',
    )
    this.load.tilemapTiledJSON('map', 'assets/maps/map.json')
    this.load.spritesheet('tilemap', 'assets/images/tilemap.png', {
      frameWidth: 10,
      frameHeight: 10,
    })
    this.load.spritesheet('people', 'assets/images/people.png', {
      frameWidth: 10,
      frameHeight: 10,
    })

    this.load.on('complete', () => {
      progress.destroy()
      this.scene.start('Game')
    })
  }
}
