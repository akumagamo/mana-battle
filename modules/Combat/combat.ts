import { Map } from "immutable"
import { Squad, SquadId } from "../Battlefield/Squad"
import { hp, Unit, UnitId } from "../Battlefield/Unit"
import { Arena, createArena } from "./arena"
import { Job, RowPosition, Skill } from "./Model"
import { sortByInitiative } from "./utils"

export default (squads: Map<SquadId, Squad>) => {
    const unitIndex = squads.reduce(
        (xs, x) => xs.merge(x.members.map((m) => m.unit)),
        Map() as Map<UnitId, Unit>
    )

    const units = sortByInitiative(unitIndex)

    const arena = createArena(unitIndex, squads)

    return units.reduce(
        ({ units, actions }, unit) => {
            const sqd = squads.find((s) =>
                s.members.some((_v, k) => k === unit.id)
            )
            if (!sqd) throw new Error()
            const skill = getUnitSkill(unit, sqd)

            const target = getTargetUnit(unit, arena)
            if (!target) throw new Error()

            const updatedActions = actions.concat([
                {
                    unit: unit.id,
                    skill: skill.id,
                    target: target.unit.id,
                },
            ])

            const updatedUnits = units.map((unit_) => {
                if (unit_.id === target.unit.id) {
                    const [min, max] = unit.hp
                    const nextHp = min - skill.damage
                    const hp_ = nextHp < 0 ? 0 : nextHp
                    return { ...unit_, ...hp([hp_, max]) }
                } else {
                    return unit_
                }
            })

            return { units: updatedUnits, actions: updatedActions }
        },
        {
            units,
            actions: [] as { unit: UnitId; skill: string; target: string }[],
        }
    )
}

const jobs: { [x: string]: Job } = {
    soldier: {
        id: "soldier",
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

function getUnitSkill(unit: Unit, squad: Squad) {
    const job = jobs[unit.job]
    const row = rowMap[squad.members.getIn([unit.id, "x"], 0) as number]

    const skillId = job.skills[row].id

    return skills[skillId]
}

function getTargetUnit(unit: Unit, arena: Arena) {
    const enemies = arena.squads.find(
        (sqd) => !sqd.members.some((_m, k) => k === unit.id)
    )
    if (!enemies) throw new Error()
    return enemies.members.first()
}
