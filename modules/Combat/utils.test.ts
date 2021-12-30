import { Map } from "immutable"
import { createUnit, Unit, UnitId, speed } from "../Battlefield/Unit"
import { sortByInitiative } from "./utils"

export const defaultUnit: Unit = createUnit("")

const makeUnit = (id: string, speed_: number): Unit => ({
    ...defaultUnit,
    id: UnitId(id),
    ...speed(speed_),
})

it("should sort by ascending order", () => {
    const result = sortByInitiative(
        Map({
            [UnitId("1")]: makeUnit("1", 1),
            [UnitId("2")]: makeUnit("2", 10),
        }) as Map<UnitId, Unit>
    )
        .map((item) => item.id)
        .toJS()

    expect(result).toEqual(["2", "1"])
})
