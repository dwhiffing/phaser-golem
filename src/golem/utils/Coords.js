export default class Coords {
  _x
  _y

  constructor({ x, y }) {
    this._x = x
    this._y = y
  }

  get x() {
    return this._x
  }

  get y() {
    return this._y
  }

  static deltas(coordsA, coordsB) {
    return {
      x: coordsA.x - coordsB.x,
      y: coordsA.y - coordsB.y,
    }
  }

  static hash({ x, y }) {
    return `${x},${y}`
  }

  static parse(hash) {
    const [x, y] = hash.split(',').map(Number)
    return new Coords({ x, y })
  }

  static match(coords_a, coords_b) {
    return coords_a.x === coords_b.x && coords_a.y === coords_b.y
  }

  static hash_many(coords) {
    return coords.map(Coords.hash)
  }

  static parse_many(hashes) {
    return hashes.map(Coords.parse)
  }

  match = (other_coords) => Coords.match(this, other_coords)

  get raw() {
    return { x: this.x, y: this.y }
  }

  get hash() {
    return Coords.hash(this)
  }


  deltas(coordinates) {
    return Coords.deltas(this, coordinates)
  }

  out_out_bounds = grid => !this.within_bounds(grid)

  within_bounds = grid => grid.within_bounds(this)

  /**
   * Updates the x & y values of the `Coords` instance.
   * */
  update = ({ x = this.x, y = this.y }) => {
    this._y = y
    this._x = x
    return this
  }
}