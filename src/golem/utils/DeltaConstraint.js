import Coords from './Coords'
import { memoize } from '../utils'

export default class DeltaConstraint {
  delta_map = {}
  deltas = []

  constructor(deltas) {
    this.deltas = deltas
    deltas.forEach(({ x, y }) => {
      if (!this.delta_map[x]) this.delta_map[x] = {}
      this.delta_map[x][y] = true
    })
  }

  get size() {
    return this.deltas.length
  }

  adjacent = memoize(
    (coords) =>
      this.deltas.map(
        (d) => new Coords({ x: coords.x + d.x, y: coords.y + d.y }),
      ),
    Coords.hash,
  )

  applies = (coords_a, coords_b) => {
    const { x, y } = Coords.deltas(coords_a, coords_b)
    return !!this.delta_map[x]?.[y]
  }

  difference = memoize(
    (coords_a, coords_b) => {
      const adjacent_a = this.adjacent(coords_a)
      const adjacent_b = this.adjacent(coords_b)

      return adjacent_b.filter(
        (next_footprint_coord) =>
          !adjacent_a.some((potential_overlap) =>
            next_footprint_coord.match(potential_overlap),
          ),
      )
    },
    (...args) => args.map(Coords.hash).join(),
  )
}