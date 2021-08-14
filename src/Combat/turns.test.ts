import { initiativeList, runCombat } from "./turns"
import createUnit from "../Unit/createUnit"
import { createSquad, createUnitSquadIndex, makeMember } from "../Squad/Model"
import { List, Map } from "immutable"
import { equals } from "../test/utils"

jest.mock("../utils/random")
jest.mock("../Unit/mods")

test("Should sort by initiave correctly", () => {
    const units = Map({
        "0": { ...createUnit("0"), dex: 9 },
        "1": { ...createUnit("1"), dex: 6 },
        "2": { ...createUnit("2"), dex: 7 },
        "3": { ...createUnit("3"), dex: 8 },
    })

    const sorted = initiativeList(units)

    equals(sorted, List(["0", "3", "2", "1"]))
})

test("Combat should have the expected outcome", () => {
    const unitIndex = Map({
        "0": createUnit("0"),
        "1": createUnit("1"),
        "2": createUnit("2"),
        "3": createUnit("3"),
    })

    const squadIndex = Map({
        s1: createSquad({
            id: "s1",
            leader: "0",
            force: "player",
            members: Map({
                "0": makeMember({ id: "0", x: 1, y: 2 }),
                "1": makeMember({ id: "1", x: 2, y: 2 }),
                "2": makeMember({ id: "2", x: 3, y: 2 }),
            }),
        }),
        s2: createSquad({
            id: "s2",
            leader: "3",
            force: "cpu",
            members: Map({
                "3": makeMember({ id: "3", x: 1, y: 2 }),
            }),
        }),
    })

    const unitSquadIndex = createUnitSquadIndex(squadIndex)

    const res = runCombat({ squadIndex, unitIndex, unitSquadIndex })
    equals(res.length, 25)

    const [last] = res.reverse()
    equals(last.type, "END_COMBAT")
})
