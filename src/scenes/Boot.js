import { TILE_SIZE } from '../constants'

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload() {
    const progress = this.add.graphics()
    this.load.on('progress', (value) => {
      const { width, height } = this.sys.game.config
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(0, 0, width * value, height)
    })

    this.load.bitmapFont('pixel', 'assets/pixel.png', 'assets/pixel.xml')
    this.load.tilemapTiledJSON('map', 'assets/maps/map2.json')
    this.load.spritesheet('tilemap', 'assets/images/tilemap.png', TILE_DIM)
    this.load.spritesheet('people', 'assets/images/people.png', TILE_DIM)

    this.load.on('complete', () => {
      progress.destroy()
      this.scene.start('Game')
    })
  }
}

const TILE_DIM = { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE }
