import * as GolemClasses from 'golem'

const WALL_TILE_INDEXES = [
  34,
  193,
  194,
  195,
  196,
  223,
  224,
  225,
  226,
  253,
  254,
  255,
  256,
  283,
  284,
  285,
  286,
]

export default class Golem {
  constructor({ map }) {
    this.heroTeam = new GolemClasses.Team()
    this.enemyTeam = new GolemClasses.Team({ hostile: [this.heroTeam] })

    const tiles = GolemClasses.create_simple_tileset(GolemClasses.Tile, 50).map(
      (row, y) =>
        row.map((tile, x) => {
          const sourceTile = map[y][x]
          const isWall = WALL_TILE_INDEXES.includes(sourceTile.index)
          tile.cost = isWall ? () => Infinity : () => 1
          return tile
        }),
    )

    this.grid = new GolemClasses.Grid({ tiles })

    this.battle = new GolemClasses.Battle(this.grid)
  }
}
