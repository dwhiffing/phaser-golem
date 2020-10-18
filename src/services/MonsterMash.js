import partition from 'lodash/partition'
import findLast from 'lodash/findLast'
import { UNIT_ATTACK_DURATION, UNIT_MOVE_DURATION } from '../constants'
import { Coords } from '../golem'

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
    const monster = this.monsters[monsterIndex]
    this.mash(monster)

    this.loop = this.scene.time.addEvent({
      delay: UNIT_MOVE_DURATION + UNIT_ATTACK_DURATION,
      repeat: -1,
      callback: () => {
        monsterIndex++
        const monster = this.monsters[monsterIndex]
        if (!monster) {
          this.loop.remove()
          return
        }

        this.mash(monster)
      },
    })
  }

  addUnit = (unit) => this.units.push(unit)

  mash = (monster) => {
    if (!monster.active) return

    const closest = this.heroes
      .filter((h) => h.active)
      .map((hero) => ({
        hero,
        distance: Phaser.Math.Distance.BetweenPoints(
          monster.deployment.coordinates.raw,
          hero.deployment.coordinates.raw,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0]

    if (!closest) return

    const target = closest.hero.deployment.coordinates.raw
    const reachable = monster.deployment.reachable_coords()
    const routeToTarget = monster.deployment
      .get_route({ to: target })
      .filter((c) => reachable.some((r) => Coords.match(c, r)))
    const moveCoord = findLast(routeToTarget, (r) => !Coords.match(r, target))

    if (moveCoord) monster.move(moveCoord)

    const targetable = monster.deployment.targetable_coords()
    if (targetable.some((t) => Coords.match(t, target))) {
      this.scene.time.addEvent({
        delay: UNIT_MOVE_DURATION,
        callback: () => monster.attack(target),
      })
    } else {
      monster.canAttack = false
    }
  }
}
