import { EventEmitter } from 'events'
import sortBy from 'lodash/sortBy'
import container, { Entity } from '../utils/container'
import Grid from './Grid'

const DEFAULT_END_CONDITION = (battle) => battle.grid.teams().length <= 1

class Battle extends Entity {
  turn_index = -1
  end_condition
  events = new EventEmitter()
  has_ended = false

  constructor(
    grid,
    { end_condition = DEFAULT_END_CONDITION, team_ordering } = {},
  ) {
    super({ grid: Grid }, () => {
      this.link_grid(grid)
      this.end_condition = end_condition
    })
  }

  get in_progress() {
    return this.turn_index !== -1 && !this.end_condition(this)
  }

  get team_ordering() {
    return sortBy(this.grid.teams(), 'id')
  }

  active_team() {
    const teams = this.team_ordering
    let team = teams[this.turn_index % teams.length]

    if (!team && teams.length) {
      let attempts = 0
      const max_attempts = teams.length

      while (!team && attempts < max_attempts) {
        attempts++
        this.turn_index++
        team = teams[this.turn_index % teams.length]
        if (!team.deployments(this.grid).length) {
          team = undefined
        }
      }
    }

    return team
  }

  advance() {
    if (this.has_ended) return
    if (this.turn_index >= 0 && !this.in_progress) {
      this.has_ended = true
      this.events.emit('battleEnd')
      return
    }
    if (this.turn_index === -1) this.events.emit('battleStart')
    this.turn_index++
    const next_team = this.active_team()
    if (next_team) this.events.emit('nextTurn', next_team)
  }
}

export default container.register(Battle)
