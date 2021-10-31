import { Map } from "immutable"
import { createUnit, Unit } from "./Model"
import { sortByInitiative } from "./utils"

export const defaultUnit: Unit = createUnit("", "")

const makeUnit = (id: string, speed: number): Unit => ({
    ...defaultUnit,
    id,
    speed,
})

it("should sort by ascending order", () => {
    const result = sortByInitiative(
        Map({ "1": makeUnit("1", 1), "2": makeUnit("2", 10) })
    )
        .map((item) => item.id)
        .toJS()

    expect(result).toEqual(["2", "1"])
})
