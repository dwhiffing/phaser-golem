import { DeltaConstraint } from './golem'
import { ORTHOGONAL_CONSTRAINT } from './golem/entities/Unit'

export const WALL_TILE_INDEXES = [
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

export const UNIT_MOVE_DURATION = 500
export const UNIT_ATTACK_DURATION = 150
export const TILE_SIZE = 10
export const WORLD_TILE_COUNT = 20
export const WORLD_SIZE = WORLD_TILE_COUNT * TILE_SIZE

export const VARIANTS = {
  base: {
    attack: {
      constraint: new DeltaConstraint(ORTHOGONAL_CONSTRAINT),
      range: 1,
    },
    movement: {
      constraint: new DeltaConstraint(ORTHOGONAL_CONSTRAINT),
      footprint: new DeltaConstraint([{ x: 0, y: 0 }]),
      steps: 8,
      can_pass_through_other_unit: false,
      unit_pass_through_limit: 0,
    },
  },
  mage: {
    attack: {
      constraint: new DeltaConstraint(
        Array(3)
          .fill(null)
          .map((_, i) => ({ x: i + 1, y: i + 1 })),
      ),
    },
    movement: {
      constraint: new DeltaConstraint(ORTHOGONAL_CONSTRAINT),
      footprint: new DeltaConstraint([{ x: 0, y: 0 }]),
      steps: 8,
      can_pass_through_other_unit: false,
      unit_pass_through_limit: 0,
    },
  },
}
