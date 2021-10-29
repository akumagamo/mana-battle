import { Arena, createArena } from "./arena"
import { Job, RowPosition, Skill, Squad, Unit } from "./Model"
import { sortByInitiative } from "./utils"

export default (squadA: Squad, squadB: Squad) => {
    const units = sortByInitiative(squadA.units.merge(squadB.units))

    const arena = createArena(squadA, squadB)

    return units.reduce(
        ({ units, actions }, unit) => {
            const skill = getUnitSkill(unit)

            const target = getTargetUnit(unit, arena)

            const updatedActions = actions.concat([
                {
                    unit: unit.id,
                    skill: skill.id,
                    target: target.id,
                },
            ])

            const updatedUnits = units.map(unit_ => {
                if (unit_.id === target.id) {
                    //replace with bounded number
                    const nextHp = unit_.hp - skill.damage
                    const hp = nextHp < 0 ? 0 : nextHp
                    return { ...unit_, hp }
                } else {
                    return unit_
                }
            })

            return { units: updatedUnits, actions: updatedActions }
        },
        {
            units,
            actions: [] as { unit: string; skill: string; target: string }[],
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
    const job = jobs[unit.job]
    const row = rowMap[unit.x]

    const skillId = job.skills[row].id

    return skills[skillId]
}

function getTargetUnit(unit: Unit, arena: Arena) {
    const enemies = arena.units.filter(u => u.squad !== unit.squad)
    return enemies.first() as Unit
}
