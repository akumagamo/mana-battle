import { Map } from "immutable"
import { createArena, printArena } from "./arena"
import { Unit } from "./Model"
import { defaultUnit } from "./utils.test"

const makeSquad = (ids: string[]) =>
    ids.reduce(
        (xs, x, i) => xs.set(x, { ...defaultUnit, id: x, x: i, y: i }),
        Map() as Map<string, Unit>
    )

const squadA = makeSquad(["a", "b", "c"])
const squadB = makeSquad(["d", "e", "f"])

const arena = createArena(squadA, squadB)
expect(printArena(arena)).toEqual(`
a ~ ~ ~ f ~ ~
~ b ~ ~ ~ e ~
~ ~ c ~ ~ ~ d
`)
