import { Map } from "immutable"
import { Job, RowPosition, Skill, Squad, Unit } from "./Model"
import { sortByInitiative } from "./utils"

export default (squadA: Squad, squadB: Squad) => {
    const units = sortByInitiative(squadA, squadB)

    return units.reduce(
        ({ units, actions }, unit) => {
            const skill = getUnitSkill(unit)

            const target = getUnitTarget(unit, arena)

            console.log(skill, target)

            return { units, actions }
        },
        {
            units,
            actions: [],
        }
    )
}

const jobs: { [x: string]: Job } = {
    fighter: {
        id: "fighter",
        skills: {
            front: { id: "slash", times: 2 },
            middle: { id: "slash", times: 2 },
            back: { id: "slash", times: 2 },
        },
    },
}

const rowMap: { [x: number]: RowPosition } = {
    0: "back",
    1: "middle",
    2: "front",
}

const skills: { [x: string]: Skill } = {
    slash: { id: "slash", damage: 22 },
}

function getUnitSkill(unit: Unit) {
    const job = jobs[unit.id]
    const row = rowMap[unit.x]

    const skillId = job.skills[row].id

    return skills[skillId]
}
