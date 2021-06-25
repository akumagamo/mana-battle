import { List, Map, Set } from 'immutable';
import { PLAYER_FORCE } from '../constants';
import maps from '../maps';
import { createSquad, makeMember, squadBuilder } from '../Squad/Model';
import { makeUnit } from '../Unit/makeUnit';
import { toMapSquad, Unit } from '../Unit/Model';
import startBattlefieldScene from '../Battlefield/startBattlefieldScene';

export default async (scene: Phaser.Scene, unit: Unit) => {
  const firstSquad = createSquad({
    id: '1',
    force: PLAYER_FORCE,
    members: Map({
      [unit.id]: makeMember({
        id: unit.id,
        x: 2,
        y: 2,
      }),
    }),
    leader: unit.id,
  });

  const alliedUnits = Map({
    [unit.id]: { ...unit, squad: '1' },
    m1: { ...makeUnit('m1', 'fighter'), squad: '1' },
    m2: { ...makeUnit('m2', 'fighter'), squad: '1' },
    m3: { ...makeUnit('m3', 'archer'), squad: '1' },
    m4: { ...makeUnit('m4', 'mage'), squad: '1' },

    c1: { ...makeUnit('c1'), squad: 'c' },
    c2: { ...makeUnit('c2'), squad: 'c' },
    c3: { ...makeUnit('c3'), squad: 'c' },
    c4: { ...makeUnit('c4'), squad: 'c' },
    c5: { ...makeUnit('c5'), squad: 'c' },
    d1: { ...makeUnit('d1'), squad: 'd' },
    d2: { ...makeUnit('d2'), squad: 'd' },
    d3: { ...makeUnit('d3'), squad: 'd' },
    d4: { ...makeUnit('d4'), squad: 'd' },
    d5: { ...makeUnit('d5'), squad: 'd' },

    // units without squad
    e5: { ...makeUnit('e5') },
    e6: { ...makeUnit('e6') },
    e7: { ...makeUnit('e7') },
    e8: { ...makeUnit('e8') },
    e9: { ...makeUnit('e9') },
    e10: { ...makeUnit('e10') },
    e11: { ...makeUnit('e11') },
    e12: { ...makeUnit('e12') },
    e13: { ...makeUnit('e13') },
  });

  const sqd = firstSquad.mergeDeep(
    Map({
      members: Map({
        m1: makeMember({ id: 'm1', x: 3, y: 1 }),
        m2: makeMember({ id: 'm2', x: 3, y: 3 }),
        m3: makeMember({ id: 'm3', x: 1, y: 1 }),
        m4: makeMember({ id: 'm4', x: 1, y: 3 }),
      }),
    })
  );

  const sqd2 = squadBuilder({
    id: 'c',
    force: PLAYER_FORCE,
    leader: 'c1',
    members: [
      ['c1', 3, 2],
      ['c2', 3, 1],
      ['c3', 3, 3],
      ['c4', 1, 1],
      ['c5', 1, 3],
    ],
  });
  const sqd3 = squadBuilder({
    id: 'd',
    force: PLAYER_FORCE,
    leader: 'd1',
    members: [
      ['d1', 3, 2],
      ['d2', 3, 1],
      ['d3', 3, 3],
      ['d4', 1, 1],
      ['d5', 1, 3],
    ],
  });

  const squads = [sqd, sqd2, sqd3];

  // todo: use scene from battlefield
  const map = maps[0]();
  const state = {
    ...map,
    dispatchedSquads: Set(List(['1']).concat(map.squads.keySeq())),
    squads: map.squads.merge(
      Map(
        squads.map((s) => [
          s.id,
          toMapSquad(
            s,
            map.cities.find((c) => c.id === 'castle1')
          ),
        ])
      )
    ),
    units: map.units.merge(alliedUnits),
  };
  startBattlefieldScene(scene, state);
};
