import { SquadRecord, MemberIndex, makeMember, createSquad } from './Model';
import { UnitClass, UnitIndex } from '../Unit/Model';
import { Map } from 'immutable';
import { makeUnit } from '../Unit/makeUnit';

type SquadGeneratorResponse = { units: UnitIndex; squad: SquadRecord };

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
  return squadGenerator(
    prefix,
    [
      ['fighter', [3, 2]],
      ['fighter', [3, 1]],
      ['fighter', [3, 3]],
      ['archer', [1, 1]],
      ['archer', [1, 3]],
    ],
    level,
    force
  );
}

/**
 * The leader will always be the first unit in the list
 */
export function squadGenerator(
  squadId: string,
  unitList: [UnitClass, [number, number]][],
  level: number,
  force: string
): { units: UnitIndex; squad: SquadRecord } {
  const unitId = (n: number) => squadId + '_unit_' + n.toString();

  const units = unitList.reduce((xs, [class_], index) => {
    return xs.set(unitId(index), {
      ...makeUnit(unitId(index), class_, level),
      squad: squadId,
    });
  }, Map() as UnitIndex);

  const members = unitList.reduce((xs, [, [x, y]], index) => {
    return xs.set(
      unitId(index),
      makeMember({
        id: unitId(index),
        x,
        y,
      })
    );
  }, Map() as MemberIndex);

  const squad: SquadRecord = createSquad({
    id: squadId,
    leader: units.get(unitId(0)).id,
    members,
    force: force,
  });

  return { units, squad };
}
