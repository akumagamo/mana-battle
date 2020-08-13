import {MapState, CellNumber} from './Model';

export const PLAYER_FORCE = 'PLAYER_FORCE';
export const CPU_FORCE = 'CPU_FORCE';

export const tileMap: {[x in CellNumber]: string} = {
  0: 'grass',
  1: 'woods',
  2: 'mountain',
  3: 'water',
  
  4: 'beach-r',
  5: 'beach-l',
  6: 'beach-t',
  7: 'beach-b',
  8: 'beach-tr',
  9: 'beach-tl',
  10: 'beach-br',
  11: 'beach-bl',


  12: 'beach-b-and-r',
  13: 'beach-t-and-r',
  14: 'beach-b-and-l',
  15: 'beach-t-and-l',

};

export const initialMapState: MapState = {
  cells: [
    [3, 3, 3, 3, 3, 9, 6, 6, 6, 15, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, ],
    [3, 3, 9, 6, 6, 15, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
    [3, 3, 5, 0, 1, 1, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, ],
    [9, 6, 15, 0, 2, 2, 0, 0, 0, 2, 0, 0, 1, 2, 0, 0, 1, 2, 0, 0, ],
    [5, 0, 0, 0, 2, 1, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, ],
    [5, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, ],
    [5, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, ],
    [11, 14, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
    [0, 11, 7, 7, 7, 7, 10, 2, 2, 2, 0, 0, 2, 2, 0, 0, 2, 2, 0, 0, ],
    [0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 1, 2, 0, 0, 1, 2, 0, 0, ],
  ],
  units: [
    {
      id: '0',
      pos: {
        x: 3,
        y: 5,
      },
      range: 5,
      status: 'alive',
      validSteps: [],
      enemiesInRange: [],
      force: PLAYER_FORCE,
    },

    {
      id: '1',
      pos: {
        x: 4,
        y: 6,
      },
      range: 5,
      validSteps: [],
      enemiesInRange: [],
      status: 'alive',
      force: PLAYER_FORCE,
    },
    {
      id: '2',
      pos: {x: 15, y: 3},
      range: 5,
      validSteps: [],
      enemiesInRange: [],
      status: 'alive',
      force: CPU_FORCE,
    },
    {
      id: '3',
      pos: {x: 13, y: 1},
      range: 5,
      validSteps: [],
      enemiesInRange: [],
      status: 'alive',
      force: CPU_FORCE,
    },
  ],
  forces: [
    {
      id: PLAYER_FORCE,
      name: 'Player',
      units: ['0', '1'],
      relations: {[CPU_FORCE]: 'hostile'},
    },
    {
      id: CPU_FORCE,
      name: 'CPU',
      units: ['2', '3'],
      relations: {[CPU_FORCE]: 'hostile'},
    },
  ],
  cities: [

    {id: 'castle1', name: 'Izabel', x: 3, y: 5, force: PLAYER_FORCE, type: 'castle'},
    {id: 'castle2', name: 'Madamaxe', x: 10, y:4, force: CPU_FORCE, type: 'castle'},
    {id: 'c1', name: 'Arabella', x: 2, y: 6, force: PLAYER_FORCE, type: 'town'},
    {id: 'c2', name: 'Marqueze', x: 10, y: 1, force: CPU_FORCE, type: 'town'},
    {id: 'c3', name: 'Bauhaus', x: 9, y: 5, force: CPU_FORCE, type: 'town'},
    {id: 'c4', name: 'Vila Rica', x: 6, y: 4, force: CPU_FORCE, type: 'town'},
  ],
};
