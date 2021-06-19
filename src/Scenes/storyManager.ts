import { PLAYER_FORCE } from '../constants';
import { fadeOut } from '../UI/Transition';
import { List, Map, Set } from 'immutable';
import { startCharaCreationScene } from '../CharaCreation/CharaCreationScene';
import { MapCommands } from '../Map/MapCommands';
import maps from '../maps';
import { startMapScene } from '../Map/MapScene';
import { createSquad, makeMember, squadBuilder } from '../Squad/Model';
import { toMapSquad } from '../Unit/Model';
import { makeUnit } from '../Unit/makeUnit';
import { startTheaterScene } from '../Theater/TheaterScene';
import chapter_1_intro from '../Theater/Chapters/chapter_1_intro';
import { turnOff } from './Title/turnOff';
import { TitleSceneState } from './Title/Model';

const GAME_SPEED = parseInt(process.env.SPEED);
export default async (parent: Phaser.Scene) => {

  const scene = await startCharaCreationScene(parent);

  const unit = await scene.createUnitForm();
  // const answers = await startTheaterScene(parent, chapter_1_intro(unit));
  // console.log(`answers`, answers);

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
    m1: { ...makeUnit({ job: 'fighter', id: 'm1', lvl: 1 }), squad: '1' },
    m2: { ...makeUnit({ job: 'fighter', id: 'm2', lvl: 1 }), squad: '1' },
    m3: { ...makeUnit({ job: 'archer', id: 'm3', lvl: 1 }), squad: '1' },
    m4: { ...makeUnit({ job: 'mage', id: 'm4', lvl: 1 }), squad: '1' },

    c1: { ...makeUnit({ job: 'fighter', id: 'c1', lvl: 1 }), squad: 'c' },
    c2: { ...makeUnit({ job: 'fighter', id: 'c2', lvl: 1 }), squad: 'c' },
    c3: { ...makeUnit({ job: 'fighter', id: 'c3', lvl: 1 }), squad: 'c' },
    c4: { ...makeUnit({ job: 'fighter', id: 'c4', lvl: 1 }), squad: 'c' },
    c5: { ...makeUnit({ job: 'fighter', id: 'c5', lvl: 1 }), squad: 'c' },
    d1: { ...makeUnit({ job: 'fighter', id: 'd1', lvl: 1 }), squad: 'd' },
    d2: { ...makeUnit({ job: 'fighter', id: 'd2', lvl: 1 }), squad: 'd' },
    d3: { ...makeUnit({ job: 'fighter', id: 'd3', lvl: 1 }), squad: 'd' },
    d4: { ...makeUnit({ job: 'fighter', id: 'd4', lvl: 1 }), squad: 'd' },
    d5: { ...makeUnit({ job: 'fighter', id: 'd5', lvl: 1 }), squad: 'd' },

    // units without squad
    e5: { ...makeUnit({ job: 'fighter', id: 'e5', lvl: 1 }) },
    e6: { ...makeUnit({ job: 'fighter', id: 'e6', lvl: 1 }) },
    e7: { ...makeUnit({ job: 'fighter', id: 'e7', lvl: 1 }) },
    e8: { ...makeUnit({ job: 'fighter', id: 'e8', lvl: 1 }) },
    e9: { ...makeUnit({ job: 'fighter', id: 'e9', lvl: 1 }) },
    e10: { ...makeUnit({ job: 'fighter', id: 'e10', lvl: 1 }) },
    e11: { ...makeUnit({ job: 'fighter', id: 'e11', lvl: 1 }) },
    e12: { ...makeUnit({ job: 'fighter', id: 'e12', lvl: 1 }) },
    e13: { ...makeUnit({ job: 'fighter', id: 'e13', lvl: 1 }) },
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

  const map = maps[0]();
  let commands: MapCommands[] = [
    {
      type: 'UPDATE_STATE',
      target: {
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
      },
    },
  ];

  startMapScene(parent, commands);
};
