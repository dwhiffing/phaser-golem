import { create_simple_tileset } from '../golem'
import { WALL_TILE_INDEXES, WORLD_TILE_COUNT } from '../constants'

export const createGolemTiles = (data) =>
  create_simple_tileset(WORLD_TILE_COUNT).map((row, y) =>
    row.map((tile, x) => {
      const sourceTile = data[y][x]
      const isWall = WALL_TILE_INDEXES.includes(sourceTile.index)
      tile.cost = isWall ? () => Infinity : () => 1
      return tile
    }),
  )
