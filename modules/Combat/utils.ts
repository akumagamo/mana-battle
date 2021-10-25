import { Squad } from "./Model"

export function sortByInitiative(squadA: Squad, squadB: Squad) {
    return squadA.merge(squadB).sort((a, b) => b.speed - a.speed)
}
