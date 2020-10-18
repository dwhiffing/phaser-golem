export { default as DeltaConstraint } from './DeltaConstraint'
export { default as Coords } from './Coords'
import Tile from '../entities/Tile'

export function memoize(fn, hashing_method, cache_size = 100) {
  const relevancy = []
  const cache = new Map()

  return new Proxy(fn, {
    apply(target, _, args) {
      const hash = hashing_method(...args)

      let data = cache.get(hash)
      if (data) {
        const index = relevancy.indexOf(hash)
        relevancy.splice(index, 1)
      } else {
        if (cache.size === cache_size) {
          const leastRelevant = relevancy[relevancy.length - 1]
          cache.delete(leastRelevant)
          relevancy.splice(cache_size - 1)
        }
        data = target(...args)
        cache.set(hash, data)
      }

      relevancy.unshift(hash)
      return data
    },
  })
}

export function create_simple_tileset(size) {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => new Tile()),
    )
}
