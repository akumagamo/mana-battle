import {Map} from 'immutable';
import {
  CellNumber,
  City,
  CPU_FORCE,
  MapState,
  PLAYER_FORCE,
} from '../API/Map/Model';
import {fighter} from '../Unit/Jobs';
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
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2 ],
  [3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 1, 0 ],
  [3, 3, 3, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0 ],
  [3, 3, 3, 0, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0 ],
  [3, 0, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 1, 0 ],
  [3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [3, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 1, 2 ],
  [3, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1 ],
  [3, 3, 3, 3, 3, 0, 0, 2, 2, 2, 0, 0, 2, 2 ],
  [3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 0, 0, 1, 2 ],
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
          enemy2: {id: 'enemy2', x: 1, y: 2, leader: false}
        },
        force: CPU_FORCE,
      },
      enemyCastle,
    ),
  ],
  forces: [
    {
      id: PLAYER_FORCE,
      name: 'Player',
      squads: ['1'],
      relations: {[CPU_FORCE]: 'hostile'},
      initialPosition: 'castle1',
    },
    {
      id: CPU_FORCE,
      name: 'Computer',
      squads: ['squad1'],
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
    enemy1: assignSquad({...fighter(0, 10), id: 'enemy1'}, {id: 'squad1', x: 2, y: 2}),
    enemy2: assignSquad({...fighter(0, 10), id: 'enemy2'}, {id: 'squad1', x: 1, y: 2}),
  }),
};

export default map;
