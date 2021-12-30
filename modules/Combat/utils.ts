import { List, Map } from "immutable"
import { Unit, UnitId } from "../Battlefield/Unit"

export function sortByInitiative(units: Map<UnitId, Unit>): List<Unit> {
    return units.toList().sort((a, b) => b.speed - a.speed)
}
