import { Unit } from "../../Unit/Model";
import { TurnUnit, isFromAnotherSquad, isAlive, transpose } from "./turns";

export function getMeleeTarget(current: Unit, units: TurnUnit[]) {
  //TODO: treatment for when multiple units are in the same distance
  return units
    .map((u) => u.unit)
    .filter(isFromAnotherSquad(current))
    .filter(isAlive)
    .map((u) => {
      if (u.squad === null) throw new Error("Null squad");
      return { ...u, squad: transpose(u.squad) };
    })
    .map((u) => ({
      distance:
        Math.abs(u.squad.x - current.squad.x) +
        Math.abs(u.squad.y - current.squad.y),
      unit: u,
    }))
    .sort((a, b) => a.distance - b.distance)[0].unit;
}
