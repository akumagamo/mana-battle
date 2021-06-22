import { List, Map } from 'immutable';
import * as CombatScene from '../../Combat/CombatScene';
import { PLAYER_FORCE } from '../../constants';
import { GAME_SPEED } from '../../env';
import { createSquad, Index } from '../../Squad/Model';
import { fadeOut } from '../../UI/Transition';
import { Unit } from '../../Unit/Model';
import CombatInitiated from '../events/CombatInitiated';
import ReturnedFromCombat from '../events/ReturnedFromCombat';
import { MapScene } from '../MapScene';
import { MapSquad, MapState } from '../Model';
import turnOff from '../turnOff';

export default async function (
  scene: MapScene,
  state: MapState,
  starter: MapSquad,
  target: MapSquad,
  direction: string
) {
  await fadeOut(scene, 1000 / GAME_SPEED);

  turnOff(scene, state);

  const isPlayer = starter.squad.force === PLAYER_FORCE;

  // for now, player always wins
  const loser = target.id;

  const combatCallback = (units: List<Unit>) => {
    let squadsTotalHP = units.reduce((xs, unit) => {
      let sqdId = unit.squad || '';

      if (!xs[sqdId]) {
        xs[sqdId] = 0;
      }

      xs[sqdId] += unit.currentHp;

      return xs;
    }, {} as { [x: string]: number });

    const updateUnits = units.map((unit) => ({ type: 'UPDATE_UNIT', unit }));

    let commands = Map(squadsTotalHP)
      .filter((v) => v === 0)
      .keySeq()
      .map((target) => ({ type: 'DESTROY_TEAM', target }))
      .concat(updateUnits)
      .toJS()
      .concat([
        {
          type: 'PUSH_SQUAD',
          winner: starter.id,
          loser: loser,
          direction,
        },
      ]);

    // TODO: use safe start
    scene.scene.start('MapScene', units.concat(commands));

    ReturnedFromCombat(scene).emit(null);
  };

  // URGENT TODO: type scene scene integration
  // change scene.state.squads to squadIndex
  CombatScene.start(scene, {
    squads: state.squads
      .filter((sqd) => [starter.id, target.id].includes(sqd.id))
      .reduce((xs, x) => xs.set(x.id, createSquad(x.squad)), Map()) as Index,
    units: state.units.filter((u) => [starter.id, target.id].includes(u.squad)),
    // GOD mode
    // .map((u) =>
    //   u.id.startsWith("player")
    //     ? { ...u, str: 999, dex: 999, hp: 999, currentHp: 999 }
    //     : u
    // ),
    top: isPlayer ? target.id : starter.id,
    bottom: isPlayer ? starter.id : target.id,
    onCombatFinish: combatCallback,
  });

  CombatInitiated(scene).emit(null);
}
