import container, { Entity } from '../utils/container'
import Unit from './Unit'

class Team extends Entity {
  hostile = new Set()
  friendly = new Set()

  constructor({
    parent,
    hostile = [],
    friendly = [],
    neutral = [],
    wildcard = [],
    index = 0,
  } = {}) {
    super(
      {
        units: [Unit],
        parent: Team,
        children: [Team],
      },
      () => {
        this.change_relationship(this, 'friendly')

        if (parent) {
          this.switch_parent(parent)
          this.change_relationship(parent, 'friendly')
        }

        this.index = index

        hostile.forEach((team) => this.change_relationship(team, 'hostile'))
        friendly.forEach((team) => this.change_relationship(team, 'friendly'))
        wildcard.forEach((team) => this.change_relationship(team, 'wildcard'))
        neutral.forEach((team) => this.change_relationship(team, 'neutral'))
      },
    )
  }

  orphan() {
    return this.unlink_parent()
  }

  switch_parent = (parent) => {
    this.parent?.unlink_children(this)
    parent.link_children(this)
    this.link_parent(parent)

    return this
  }

  change_relationship = (team, relationship) => {
    switch (relationship) {
      case 'friendly':
        this.change_relationship(team, 'neutral')
        this.friendly.add(team.id)
        team.friendly.add(this.id)
        break
      case 'hostile':
        this.change_relationship(team, 'neutral')
        this.hostile.add(team.id)
        team.hostile.add(this.id)
        break
      case 'neutral':
        this.hostile.delete(team.id)
        this.friendly.delete(team.id)
        team.hostile.delete(this.id)
        team.friendly.delete(this.id)
        break
      case 'wildcard':
        this.hostile.add(team.id)
        this.friendly.add(team.id)
        team.hostile.add(this.id)
        team.friendly.add(this.id)
        break
      default:
        break
    }
    return this
  }

  progenitor = () => this.parent?.progenitor() || this

  descendants = () =>
    this.children.reduce((acc, child) => {
      acc.push(child, ...child.descendants())
      return acc
    }, [])

  deployments = (grid) =>
    grid.deployments.filter((d) => d.unit.team.id === this.id)

  is = (team, relationship) => {
    switch (relationship) {
      case 'neutral':
        return !this.is(team, 'friendly') && !this.is(team, 'hostile')
      case 'wildcard':
        return this.is(team, 'friendly') && this.is(team, 'hostile')
      case 'hostile':
        return this.hostile.has(team.id) || !!this.parent?.is(team, 'hostile')
      case 'friendly':
        return this.friendly.has(team.id) || !!this.parent?.is(team, 'friendly')
      default:
        break
    }
  }

  clone = (overrides = {}) =>
    new Team({
      parent: this.parent,
      hostile: [...this.hostile],
      friendly: [...this.friendly],
      ...overrides,
    })
}

export default container.register(Team)
