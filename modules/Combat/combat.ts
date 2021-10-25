import { sortByInitiative } from "./utils"

export default (squadA: Squad, squadB: Squad) => {
    const units = sortByInitiative(squadA, squadB)

    return units.reduce(({ units, actions }, unit) => ({ units, actions }), {
        units,
        actions: [],
    })
}
