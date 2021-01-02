import { maleNames } from "../constants/names";
import { randomItem } from "../utils";
import { makeUnit } from "../Unit/Jobs";
import { Squad, SquadMemberMap } from "./Model";
import { Unit, UnitClass } from "../Unit/Model";

type SquadGeneratorResponse = { units: { [id: string]: Unit }; squad: Squad };

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
  const leaderName = randomItem(maleNames);

  const unitId = (n: number) => squadId + "_unit_" + n.toString();

  const units = units_.reduce((xs, [class_, [x, y]], index) => {
    return {
      ...xs,
      [unitId(index)]: {
        ...makeUnit(class_, unitId(index), level),
        squad: { id: squadId, x, y },
      },
    };
  }, {} as { [id: string]: Unit });

  const members = units_.reduce((xs, [, [x, y], leader], index) => {
    return {
      ...xs,
      [unitId(index)]: {
        id: unitId(index),
        x,
        y,
        leader,
      },
    };
  }, {} as SquadMemberMap);

  const squad: Squad = {
    id: squadId,
    name: leaderName,
    members,
    force: force,
  };

  return { units, squad };
}
