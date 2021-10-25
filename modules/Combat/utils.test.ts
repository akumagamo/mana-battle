import { Map } from "immutable"
import { Unit } from "./Model"
import { sortByInitiative } from "./utils"

export const defaultUnit: Unit = {
    id: "",
    name: "",
    speed: 0,
    x: 0,
    y: 0,
}

const makeUnit = (id: string, speed: number): Unit => ({
    ...defaultUnit,
    id,
    speed,
})

it("should sort by ascending order", () => {
    const result = sortByInitiative(
        Map({ "1": makeUnit("1", 1) }),
        Map({ "2": makeUnit("2", 10) })
    )
        .keySeq()
        .toJS()

    expect(result).toEqual(["2", "1"])
})
