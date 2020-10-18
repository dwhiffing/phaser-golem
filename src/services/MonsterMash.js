import partition from 'lodash/partition'
import sample from 'lodash/sample'
import last from 'lodash/last'
import { UNIT_MOVE_DURATION } from '../constants'

export default class MonsterMash {
  constructor(scene, units) {
    this.scene = scene
    this.units = units
    this.scene.battle.events.on('nextTurn', this.handleNextTurn)

    const [heroes, monsters] = partition(
      this.scene.objectGroup.getChildren(),
      (unit) => unit.team.id === this.scene.heroTeam.id,
    )
    this.heroes = heroes
    this.monsters = monsters
  }

  handleNextTurn = (activeTeam) => {
    const isHeroTeam = this.scene.heroTeam.id === activeTeam.id
    if (isHeroTeam) return

    let monsterIndex = 0

    this.loop = this.scene.time.addEvent({
      delay: 2000,
      repeat: -1,
      callback: () => {
        const monster = this.monsters[monsterIndex]
        if (!monster) {
          this.loop.remove()
          return
        }

        this.mash(monster)
        monsterIndex++
      },
    })
  }

  addUnit = (unit) => this.units.push(unit)

  mash = (monster) => {
    if (!monster.active) return

    const target = Phaser.Math.RND.pick(this.heroes)
    const routeToTarget = monster.deployment.get_route({
      to: target.deployment.coordinates.raw,
    })
    const targetPosition = routeToTarget[routeToTarget.length - 2]
    const unitPosition = routeToTarget[routeToTarget.length - 1]

    // TODO: unit#move should accept coords instead of tile highlights
    monster.move({ getCoord: () => targetPosition || unitPosition })

    this.scene.time.addEvent({
      delay: UNIT_MOVE_DURATION,
      callback: () => {
        monster.attack({
          getCoord: () => unitPosition,
          highlight: { tile: target.deployment.tile },
        })
      },
    })
  }
}
