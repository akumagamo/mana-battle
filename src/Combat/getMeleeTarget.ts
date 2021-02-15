import * as Squad from "../Squad/Model";
import { printSquad } from "../Squad/Model.test";
import { isAlive, UnitIndex, UnitInSquad } from "../Unit/Model";

// TODO: this should receive alive members
export function getMeleeTarget(
  current: UnitInSquad,
  unitIndex: UnitIndex,
  squadIndex: Squad.Index
): Squad.MemberRecord {
  const aliveIndex = Squad.filterMembers((m) => isAlive(unitIndex.get(m.id)))(
    squadIndex
  );

  const transposedIndex = Squad.mapMembers(Squad.transpose)(current.squad)(
    aliveIndex
  );

  const units = Squad.rejectUnitsFromSquad(current.squad)(transposedIndex);

  const get = (unitId: string, squadId: string) =>
    transposedIndex.get(squadId).members.get(unitId);

  const sorted = units
    .map((unit) => ({
      distance:
        Math.abs(unit.x - get(current.id, current.squad).x) +
        Math.abs(unit.y - get(current.id, current.squad).y),
      unit,
    }))
    .sort((a, b) => a.distance - b.distance);

  return sorted.map((u) => u.unit).first<Squad.MemberRecord>();
}
