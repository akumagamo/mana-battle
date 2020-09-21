import {Map} from 'immutable';
import {
  CellNumber,
  City,
  CPU_FORCE,
  MapState,
  PLAYER_FORCE,
} from '../API/Map/Model';
import {makeUnit} from '../Unit/Jobs';
import {assignSquad, toMapSquad} from '../Unit/Model';

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
const map: MapState = {
  id: 'greenHarbor',
  name: 'Green Harbor',
  author: 'Leonardo Farroco',
  description: 'The first map',
  cells: tiles,
  mapSquads: [
    toMapSquad(
      {
        id: 'squad1',
        name: 'Derpy',
        emblem: 'smile',
        members: {
          enemy1: {id: 'enemy1', x: 2, y: 2, leader: true},
          enemy2: {id: 'enemy2', x: 1, y: 3, leader: false},
          enemy3: {id: 'enemy3', x: 2, y: 3, leader: false},
          enemy4: {id: 'enemy4', x: 3, y: 3, leader: false},
        },
        force: CPU_FORCE,
      },
      enemyCastle,
    ),
    toMapSquad(
      {
        id: 'squad2',
        name: 'Herpy',
        emblem: 'smile',
        members: {
          enemy5: {id: 'enemy5', x: 2, y: 2, leader: true},
          enemy6: {id: 'enemy6', x: 1, y: 3, leader: false},
          enemy7: {id: 'enemy7', x: 2, y: 3, leader: false},
          enemy8: {id: 'enemy8', x: 3, y: 3, leader: false},
        },
        force: CPU_FORCE,
      },
      {x: 11, y: 4},
    ),
  ],
  forces: [
    {
      id: PLAYER_FORCE,
      name: 'Lankel Knights',
      squads: ['1'],
      relations: {[CPU_FORCE]: 'hostile'},
      initialPosition: 'castle1',
    },
    {
      id: CPU_FORCE,
      name: 'Enemy',
      squads: ['squad1', 'squad2'],
      relations: {[PLAYER_FORCE]: 'hostile'},
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
    {id: 'c1', name: 'Arabella', x: 2, y: 6, force: CPU_FORCE, type: 'town'},
    {id: 'c2', name: 'Marqueze', x: 10, y: 1, force: CPU_FORCE, type: 'town'},
    {id: 'c3', name: 'Bauhaus', x: 9, y: 5, force: CPU_FORCE, type: 'town'},
    {id: 'c4', name: 'Vila Rica', x: 6, y: 4, force: CPU_FORCE, type: 'town'},
  ],
  units: Map({
    enemy1: assignSquad(
      {...makeUnit('fighter', 0, 10), id: 'enemy1'},
      {id: 'squad1', x: 2, y: 2},
    ),
    enemy2: assignSquad(
      {...makeUnit('fighter', 0, 10), id: 'enemy2'},
      {id: 'squad1', x: 1, y: 3},
    ),
    enemy3: assignSquad(
      {...makeUnit('fighter', 0, 10), id: 'enemy3'},
      {id: 'squad1', x: 2, y: 3},
    ),
    enemy4: assignSquad(
      {...makeUnit('fighter', 0, 10), id: 'enemy4'},
      {id: 'squad1', x: 3, y: 3},
    ),

    enemy5: assignSquad(
      {...makeUnit('fighter', 0, 10), id: 'enemy5'},
      {id: 'squad2', x: 2, y: 2},
    ),
    enemy6: assignSquad(
      {...makeUnit('fighter', 0, 10), id: 'enemy6'},
      {id: 'squad2', x: 1, y: 3},
    ),
    enemy7: assignSquad(
      {...makeUnit('fighter', 0, 10), id: 'enemy7'},
      {id: 'squad2', x: 2, y: 3},
    ),
    enemy8: assignSquad(
      {...makeUnit('fighter', 0, 10), id: 'enemy8'},
      {id: 'squad2', x: 3, y: 3},
    ),
  }),
  ai: Map({
    squad1: 'DEFEND',
    squad2: 'DEFEND',
    squad3: 'DEFEND',
  }),
};

export default map;
