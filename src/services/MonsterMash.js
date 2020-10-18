import partition from 'lodash/partition'
import sample from 'lodash/sample'
import last from 'lodash/last'

export default class MonsterMash {
    constructor(scene, units) {
        this.scene = scene
        this.units = units
        this.scene.battle.events('nextTurn', this.handleNextTurn)

        const [heroes, monsters] = partition(
            this.scene.objectGroup.getChildren(),
            unit => unit.team.id === this.scene.heroTeam.id
        )
        this.heroes = heroes
        this.monsters = monsters
    }

    handleNextTurn = activeTeam => {
        const isHeroTeam = this.scene.heroTeam.id === activeTeam.id
        if (isHeroTeam) return

        this.monsters.forEach(this.mash)
    }

    addUnit = unit => this.units.push(unit)

    mash = monster => {

    }
}
