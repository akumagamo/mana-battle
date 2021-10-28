import { List, Map } from "immutable"
import { Unit } from "./Model"

export function sortByInitiative(units: Map<string, Unit>): List<Unit> {
    return units.toList().sort((a, b) => b.speed - a.speed)
}
