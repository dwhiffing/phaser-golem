import Tile from '../../entities/Tile'

/**
 * Validate a map to ensure all it's values are either a number or a map
 *
 * @param {Map} map - Map to validate
 */
export default function validateDeep(map) {
  if (!(map instanceof Map)) {
    throw new Error(`Invalid graph: Expected Map instead found ${typeof map}`)
  }

  map.forEach((value, key) => {
    if (typeof value === 'object' && value instanceof Map) {
      validateDeep(value)
      return
    }

    if (!(value instanceof Tile)) {
      throw new Error(
        `Values must be Tile instances. Found value ${value} at ${key}`,
      )
    }
  })
}
