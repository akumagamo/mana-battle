import { PLAYER_FORCE } from '../constants';
import { fadeOut } from '../UI/Transition';
import { List, Map, Set } from 'immutable';
import { startCharaCreationScene } from '../CharaCreation/CharaCreationScene';
import { MapCommands } from '../Map/MapCommands';
import maps from '../maps';
import { startMapScene } from '../Map/MapScene';
import { makeSquad, makeMember } from '../Squad/Model';
import { toMapSquad } from '../Unit/Model';
import TitleScene from './TitleScene';
import { makeUnit } from '../Unit/makeUnit';
import { startTheaterScene } from '../Theater/TheaterScene';
import chapter_1_intro from '../Theater/Chapters/chapter_1_intro';

export const storyManager = async (parent: TitleScene) => {
  parent.tweens.add({
    targets: parent.music,
    volume: 0,
    duration: 1000,
  });
  await fadeOut(parent);

  parent.container.destroy();
  const scene = await startCharaCreationScene(parent);

  const unit = await scene.createUnitForm();
  console.log(`unit`, unit);
  // const answers = await startTheaterScene(parent, chapter_1_intro(unit));
  // console.log(`answers`, answers);

  const firstSquad = makeSquad({
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
    m1: { ...makeUnit('fighter', 'm1', 1), squad: '1' },
    m2: { ...makeUnit('fighter', 'm2', 1), squad: '1' },
    m3: { ...makeUnit('archer', 'm3', 1), squad: '1' },
    m4: { ...makeUnit('mage', 'm4', 1), squad: '1' },
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

  const squads = [sqd];

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
