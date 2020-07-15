import {MapState, CellNumber} from "./Model";

export const PLAYER_FORCE = 'PLAYER_FORCE';
export const CPU_FORCE = 'CPU_FORCE';

export const tileMap: {[x in CellNumber]: string} = {
  0: 'grass',
  1: 'woods',
  2: 'mountain',
};

export const initialMapState: MapState = {
  cells: [
    [0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
  ],
  units: [
    {
      id: '0',
      pos: {
        x: 0,
        y: 0,
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
        x: 3,
        y: 2,
      },
      range: 5,
      validSteps: [],
      enemiesInRange: [],
      status: 'alive',
      force: PLAYER_FORCE,
    },
    {
      id: '2',
      pos: {x: 0, y: 3},
      range: 5,
      validSteps: [],
      enemiesInRange: [],
      status: 'alive',
      force: CPU_FORCE,
    },
    {
      id: '3',
      pos: {x: 3, y: 1},
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
    {id: 'a1', name: 'Arabella', x: 1, y: 1, force: PLAYER_FORCE, type: 'town'},
    {id: 'm1', name: 'Marqueze', x: 3, y: 1, force: CPU_FORCE, type: 'town'},
  ],
};
