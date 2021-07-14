import {List, Map} from 'immutable';
import * as CombatScene from '../../Combat/CombatScene';
import {PLAYER_FORCE} from '../../constants';
import {GAME_SPEED} from '../../env';
import {createSquad, Index} from '../../Squad/Model';
import {fadeOut} from '../../UI/Transition';
import {Unit} from '../../Unit/Model';
import CombatInitiated from '../events/CombatInitiated';
import ReturnedFromCombat from '../events/ReturnedFromCombat';
import {getChara, getMapSquad, MapSquad, MapState} from '../Model';
import turnOff from '../turnOff';
import markSquadForRemoval from './markSquadForRemoval';

export default async function (
  scene: Phaser.Scene,
  state: MapState,
  starter: MapSquad,
  target: MapSquad,
) {
  await fadeOut(scene, 1000 / GAME_SPEED);

  turnOff(scene, state);

  const isPlayer = starter.squad.force === PLAYER_FORCE;

  const combatCallback = (
    units: List<Unit>,
    squadDamage: Map<string, number>,
  ) => {
    let squadsTotalHP = units.reduce((xs, unit) => {
      let sqdId = unit.squad || '';

      if (!xs[sqdId]) {
        xs[sqdId] = 0;
      }

      xs[sqdId] += unit.currentHp;

      return xs;
    }, {} as {[x: string]: number});

    units.forEach((unit) => (state.units = state.units.set(unit.id, unit)));

    Map(squadsTotalHP)
      .filter((v) => v === 0)
      .keySeq()
      .forEach((target) => markSquadForRemoval(state, target));

    const sortedSquads = squadDamage.sort().keySeq();

    const loser = getMapSquad(state, sortedSquads.first());

    const winner = getMapSquad(state, sortedSquads.last());

    const direction = () => {
      if (winner.pos.x < loser.pos.x) return 'right';
      else if (winner.pos.x > loser.pos.x) return 'left';
      else if (winner.pos.y < loser.pos.y) return 'bottom';
      else if (winner.pos.y > loser.pos.y) return 'top';
    };

    console.log(`>>>`, winner, loser, direction());

    state.squadToPush = {
      winner: winner.id,
      loser: loser.id,
      direction: direction(),
    };

    scene.scene.start('MapScene', state);

    ReturnedFromCombat(scene).emit(null);
  };

  console.log(`starting`);
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
