import { Modifier, ItemSlot, ItemMap } from "../Item/Model"
import { sum } from "../utils/math"
import { MapSquad, Vector } from "../Battlefield/Model"
import { SquadRecord, UnitSquadIndex } from "../Squad/Model"
import { Map } from "immutable"
import { cellToScreenPosition } from "../Battlefield/board/position"
import { CPU_FORCE } from "../constants"
import { INVALID_STATE } from "../errors"

// todo: refactor all operations that perform transformations on units and unitindexes
// to use functions from here

export type UnitIndex = Map<string, Unit>

export const emptyUnitIndex = Map() as UnitIndex

export const getUnit = (id: string, index: UnitIndex) => {
    const unit = index.get(id)

    if (!unit)
        throw new Error(
            `INVALID_STATE - failed to get unit ${id} on provided index`
        )

    return unit
}

export type Stat = "str" | "dex" | "int"
export const statLabels: {
    [stat in Stat]: string
} = {
    str: "Strength",
    dex: "Dexterity",
    int: "Intelligence",
}

export enum Gender {
    Male = "male",
    Female = "female",
}
export const genders: Gender[] = [Gender.Male, Gender.Female]
export const genderLabels: { [gender in Gender]: string } = {
    male: "Male",
    female: "Female",
}

export type Elem =
    | "fire"
    | "water"
    | "earth"
    | "wind"
    | "light"
    | "shadow"
    | "neutral"

export type UnitJobs = "fighter" | "mage" | "archer"

export type Movement = "plain" | "mountain" | "sky" | "forest"

export const update = (unit: Unit) => (index: UnitIndex) =>
    index.set(unit.id, unit)

export type Unit = {
    id: string
    name: string
    job: UnitJobs
    gender: Gender
    movement: Movement
    force: string
    lvl: number
    hp: number
    currentHp: number
    exp: number
    str: number
    dex: number
    int: number
    equips: {
        [x in ItemSlot]: string
    }
    elem: Elem
}

export const createUnit = (id: string): Unit => ({
    id,
    name: "",
    job: "fighter",
    gender: "male" as Gender,
    movement: "plain", // this should belong to a job
    force: CPU_FORCE,
    lvl: 1,
    hp: 50,
    currentHp: 50,
    exp: 0,
    str: 10,
    dex: 10,
    int: 10,
    equips: {
        mainHand: "",
        offHand: "",
        chest: "",
        ornament: "",
        head: "",
    },
    elem: "fire",
})

export function toMapSquad(squad: SquadRecord, pos: Vector): MapSquad {
    return {
        id: squad.id,
        squad,
        posScreen: cellToScreenPosition({ x: pos.x, y: pos.y }),
        status: "standing",
    }
}

function getItemModifier({
    unit,
    stat,
    items,
    slot,
}: {
    unit: Unit
    stat: Modifier
    items: ItemMap
    slot: ItemSlot
}) {
    const itemId = unit.equips[slot]

    const item = items.get(itemId)

    if (!item) {
        throw new Error("Invalid State: Item should be in index")
    }

    const modifier = item.modifiers[stat]

    if (modifier) return modifier
    else return 0
}

const equipKeys: ItemSlot[] = ["mainHand", "offHand", "chest", "ornament"]

export function getActualStat(stat: Stat, items: ItemMap, unit: Unit) {
    const value = unit[stat]

    const values = equipKeys.map(equip =>
        getItemModifier({ unit, stat, items, slot: equip })
    )

    return value + values.reduce(sum, 0)
}

export function isAlive(unit: Unit) {
    return unit.currentHp > 0
}

export const unitsWithoutSquad = (
    unitMap: UnitIndex,
    unitSquadIndex: UnitSquadIndex
) => unitMap.filter(unit => !unitSquadIndex.get(unit.id))
