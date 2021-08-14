import { List } from "immutable"
import { equals } from "../test/utils"
import { squadGenerator } from "./generator"
import { makeMember } from "./Model"

test("generates units", () => {
    const squadId = "SQD1"

    const { squad, units } = squadGenerator(
        squadId,
        [
            ["fighter", [2, 1]],
            ["archer", [2, 2]],
        ],
        22,
        "TEST_FORCE"
    )

    expect(squad.id).toBe(squadId)

    const unit1Id = `${squadId}_unit_0`
    const unit2Id = `${squadId}_unit_1`

    equals(squad.members.keySeq().toList(), List([unit1Id, unit2Id]))

    equals(
        squad.members.get(unit1Id),
        makeMember({
            id: unit1Id,
            x: 2,
            y: 1,
        })
    )
    equals(
        squad.members.get(unit2Id),
        makeMember({
            id: unit2Id,
            x: 2,
            y: 2,
        })
    )

    const get = (id: string) => {
        const unit = units.get(id)
        if (!unit) throw new Error("Non existing id")
        return unit
    }

    equals(get(unit1Id).job, "fighter")
    equals(get(unit2Id).job, "archer")

    equals(get(unit1Id).lvl, 22)
    equals(get(unit2Id).lvl, 22)
})
