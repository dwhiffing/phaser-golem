import container, { Entity } from '../utils/container'
import Deployment from './Deployment'

class Tile extends Entity {
  should_guard_entry
  should_guard_crossover
  cost

  constructor({
    should_guard_entry = () => false,
    should_guard_crossover = () => false,
    cost = () => 1,
  } = {}) {
    super({ deployment: Deployment })
    this.cost = cost
    this.should_guard_entry = should_guard_entry
    this.should_guard_crossover = should_guard_crossover
  }
}

export default container.register(Tile)
