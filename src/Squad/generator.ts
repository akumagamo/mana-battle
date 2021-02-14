import { Squad, MemberIndex, makeSquadMember, makeSquad } from "./Model";
import { UnitClass, UnitIndex } from "../Unit/Model";
import { Map } from "immutable";
import { makeUnit } from "../Unit/makeUnit";

type SquadGeneratorResponse = { units: UnitIndex; squad: Squad };

/**
 * a _ f
 * _ _ f
 * a _ F
 */
export function fighterArcherSquad(
  force: string,
  prefix: string,
  level: number
): SquadGeneratorResponse {
  const units: [UnitClass, [number, number], boolean][] = [
    ["fighter", [3, 1], false],
    ["fighter", [3, 2], true],
    ["fighter", [3, 3], false],
    ["archer", [1, 1], false],
    ["archer", [1, 3], false],
  ];

  return squadGenerator(prefix, units, level, force);
}

export function squadGenerator(
  squadId: string,
  units_: [UnitClass, [number, number], boolean][],
  level: number,
  force: string
) {
  const unitId = (n: number) => squadId + "_unit_" + n.toString();

  const units = units_.reduce((xs, [class_], index) => {
    return xs.set(unitId(index), {
      ...makeUnit(class_, unitId(index), level),
      squad: squadId,
    });
  }, Map() as UnitIndex);

  const members = units_.reduce((xs, [, [x, y]], index) => {
    return xs.set(
      unitId(index),
      makeSquadMember({
        id: unitId(index),
        x,
        y,
      })
    );
  }, Map() as MemberIndex);

  const squad: Squad = makeSquad({
    id: squadId,
    leader: unitId(units_.findIndex(([, , leader]) => leader)),
    members,
    force: force,
  });

  return { units, squad };
}
