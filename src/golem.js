import * as GolemClasses from 'golem'

export default class Golem {
  constructor({ map }) {
    this.heroTeam = new GolemClasses.Team()
    this.enemyTeam = new GolemClasses.Team({ hostile: [this.heroTeam] })

    const tiles = GolemClasses.create_simple_tileset(GolemClasses.Tile, 50).map(
      (row, y) =>
        row.map((tile, x) => {
          const sourceTile = map[y][x]
          const isWall = sourceTile.index === 34
          tile.cost = isWall ? () => Infinity : () => 1
          return tile
        }),
    )

    this.grid = new GolemClasses.Grid({ tiles })

    this.battle = new GolemClasses.Battle(this.grid)
  }
}
