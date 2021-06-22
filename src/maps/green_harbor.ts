import { List, Map, Set } from 'immutable';
import {
  CellNumber,
  City,
  initialBattlefieldState,
  MapState,
} from '../Battlefield/Model';
import { makeUnit } from '../Unit/makeUnit';
import { toMapSquad } from '../Unit/Model';
import { CPU_FORCE, PLAYER_FORCE } from '../constants';
import { createSquad, makeMember } from '../Squad/Model';
import { Container } from '../Models';
import { DEFAULT_MODE } from '../Battlefield/Mode';

const enemyCastle: City = {
  id: 'castle2',
  name: 'Madamaxe',
  x: 10,
  y: 4,
  force: CPU_FORCE,
  type: 'castle',
};

const tiles: CellNumber[][] = [
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 0],
  [3, 3, 3, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0],
  [3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0],
  [3, 0, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 1, 0],
  [3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 1, 2],
  [3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [3, 3, 3, 3, 3, 0, 0, 2, 2, 2, 0, 0, 2, 2],
  [3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 0, 0, 1, 2],
];
const map: () => MapState = () => {
  return {
    ...initialBattlefieldState,
    id: 'greenHarbor',
    name: 'Green Harbor',
    author: 'Leonardo Farroco',
    description: 'The first map',
    cells: tiles,
    squads: List([
      toMapSquad(
        createSquad({
          id: 'squad1',
          leader: 'enemy1',
          members: Map({
            enemy1: makeMember({ id: 'enemy1', x: 1, y: 2 }),
            enemy2: makeMember({ id: 'enemy2', x: 3, y: 1 }),
            enemy3: makeMember({ id: 'enemy3', x: 3, y: 2 }),
            enemy4: makeMember({ id: 'enemy4', x: 3, y: 3 }),
          }),
          force: CPU_FORCE,
        }),
        { x: 6, y: 4 }
      ),
      toMapSquad(
        createSquad({
          id: 'squad2',
          leader: 'enemy5',
          members: Map({
            enemy5: makeMember({ id: 'enemy5', x: 2, y: 2 }),
            enemy6: makeMember({ id: 'enemy6', x: 3, y: 1 }),
            enemy7: makeMember({ id: 'enemy7', x: 3, y: 2 }),
            enemy8: makeMember({ id: 'enemy8', x: 3, y: 3 }),
          }),
          force: CPU_FORCE,
        }),
        enemyCastle
      ),
    ]).reduce((xs, x) => xs.set(x.id, x), Map()),
    forces: [
      {
        id: PLAYER_FORCE,
        name: 'Lankel Knights',
        squads: [],
        relations: { [CPU_FORCE]: 'hostile' },
        initialPosition: 'castle1',
      },
      {
        id: CPU_FORCE,
        name: 'Enemy',
        squads: ['squad1', 'squad2'],
        relations: { [PLAYER_FORCE]: 'hostile' },
        initialPosition: 'castle2',
      },
    ],
    cities: [
      {
        id: 'castle1',
        name: 'Izabel',
        x: 3,
        y: 5,
        force: PLAYER_FORCE,
        type: 'castle',
      },
      enemyCastle,
      {
        id: 'c1',
        name: 'Arabella',
        x: 2,
        y: 6,
        force: CPU_FORCE,
        type: 'town',
      },
      {
        id: 'c2',
        name: 'Marqueze',
        x: 10,
        y: 1,
        force: CPU_FORCE,
        type: 'town',
      },
      { id: 'c3', name: 'Bauhaus', x: 9, y: 5, force: CPU_FORCE, type: 'town' },
      {
        id: 'c4',
        name: 'Vila Rica',
        x: 6,
        y: 4,
        force: CPU_FORCE,
        type: 'town',
      },
    ],
    units: Map({
      enemy1: {
        ...makeUnit({ id: 'enemy1' }),
        squad: 'squad1',
        force: CPU_FORCE,
      },
      enemy2: {
        ...makeUnit({ id: 'enemy2' }),
        squad: 'squad1',
        force: CPU_FORCE,
      },
      enemy3: {
        ...makeUnit({ id: 'enemy3' }),
        squad: 'squad1',
        force: CPU_FORCE,
      },
      enemy4: {
        ...makeUnit({ id: 'enemy4' }),
        squad: 'squad1',
        force: CPU_FORCE,
      },
      enemy5: {
        ...makeUnit({ id: 'enemy5' }),
        squad: 'squad2',
        force: CPU_FORCE,
      },
      enemy6: {
        ...makeUnit({ id: 'enemy6' }),
        squad: 'squad2',
        force: CPU_FORCE,
      },
      enemy7: {
        ...makeUnit({ id: 'enemy7' }),
        squad: 'squad2',
        force: CPU_FORCE,
      },
      enemy8: {
        ...makeUnit({ id: 'enemy8' }),
        squad: 'squad2',
        force: CPU_FORCE,
      },
    }),
    ai: Map({
      squad1: 'DEFEND',
      squad2: 'DEFEND',
      squad3: 'DEFEND',
    }),
  };
};

export default map;
