import container, { Entity } from '../utils/container'
import DeltaConstraint from '../utils/DeltaConstraint'
import Team from './Team'
import Deployment from './Deployment'

export const ORTHOGONAL_CONSTRAINT = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

class Unit extends Entity {
  movement

  constructor({
    attack: {
      constraint: attackConstraint = new DeltaConstraint(ORTHOGONAL_CONSTRAINT),
      range: attackRange = 1,
    } = {},
    movement: {
      constraint = new DeltaConstraint(ORTHOGONAL_CONSTRAINT),
      footprint = new DeltaConstraint([{ x: 0, y: 0 }]),
      steps = 1,
      can_pass_through_other_unit,
      unit_pass_through_limit = Infinity,
    } = {},
    team,
  }) {
    super({ team: Team, deployment: Deployment }, () => {
      this.switch_team(team)
      this.attack = {
        constraint: attackConstraint,
        range: attackRange,
      }
      this.movement = {
        can_pass_through_other_unit:
          can_pass_through_other_unit ||
          ((unit) =>
            unit.team.is(this.team, 'friendly') ||
            unit.team.is(this.team, 'neutral')),
        constraint,
        footprint,
        steps,
        unit_pass_through_limit,
      }
    })
  }

  switch_team = (team) => {
    this.team?.unlink_units(this)
    this.link_team(team)
    team.link_units(this)
    return this
  }

  get is_dead() {
    return this.current_health <= 0
  }
}

export default container.register(Unit)
