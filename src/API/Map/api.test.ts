// @ts-nocheck

import {getPossibleMoves} from './api';
import {Just, map} from 'sanctuary';
import {Map, Range, Set} from 'immutable';
import {MapState, TurnManager} from './Model';
const defaultParams: TurnManager = {
  currentForce: 'a',
  forces: [
    {
      id: 'a',
      squads: ['a1'],
      name: 'a',
      relations: {['b']: 'hostile'},
      initialPosition: 'castle1',
    },
    {
      id: 'b',
      squads: ['b1'],
      name: 'b',
      relations: {['a']: 'hostile'},
      initialPosition: 'castle2',
    },
  ],
  grid: [
    [0, 1, 1, 1, 1],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
  ],
  walkableCells: [0],
  mapSquads: [
    {
      id: 'a1',
      pos: {x: 0, y: 0},
      enemiesInRange: [],
      validSteps: [],
      range: 2,
      force: 'a',
      name: '',
      emblem: '',
      members: {},
      status: 'alive',
    },
    {
      id: 'b1',
      pos: {x: 3, y: 3},
      enemiesInRange: [],
      validSteps: [],
      range: 2,
      force: 'b',
      name: '',
      emblem: '',
      members: {},
      status: 'alive',
    },
  ],
};

test('Get moves in straight line', () => {
  const cells = getPossibleMoves(defaultParams);

  const lens = map((c) => c[0].validSteps.map((t) => t.target));

  const expected = Just([
    {x: 0, y: 1},
    {x: 0, y: 2},
  ]);

  expect(lens(cells)).toEqual(expected);
});

test('Make a turn', () => {
  const longerRange = {
    ...defaultParams,

    mapSquads: defaultParams.mapSquads.map((unit) =>
      unit.id === 'a1' ? {...unit, range: 4} : unit,
    ),
  };
  const cells = getPossibleMoves(longerRange);

  const lens = map((c) => c[0].validSteps.map((t) => t.target));

  const expected = Just([
    {x: 0, y: 1},
    {x: 0, y: 2},
    {x: 0, y: 3},
    {x: 1, y: 3},
  ]);

  expect(lens(cells)).toEqual(expected);
});

test('Get moves in blocked path ', () => {
  const path = {
    ...defaultParams,
    grid: [
      [0, 1, 1, 1, 1],
      [0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 0, 0, 1, 0],
      [1, 1, 1, 1, 1],
    ],

    mapSquads: defaultParams.mapSquads.map((unit) =>
      unit.id === 'a1' ? {...unit, range: 4} : unit,
    ),
  };
  const cells = getPossibleMoves(path);

  const lens = map((c) => c[0].validSteps.map((t) => t.target));
  const expected = Just([
    {x: 0, y: 1},
    {x: 0, y: 2},
  ]);

  expect(lens(cells)).toEqual(expected);
});

test('Get moves in forked path ', () => {
  const path = {
    ...defaultParams,
    grid: [
      [0, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1],
    ],

    mapSquads: defaultParams.mapSquads.map((unit) =>
      unit.id === 'a1' ? {...unit, range: 4} : unit,
    ),
  };
  const cells = getPossibleMoves(path);

  const expected = Just(
    Set([
      {x: 0, y: 1},
      {x: 0, y: 2},
      {x: 0, y: 3},
      {x: 1, y: 1},
      {x: 1, y: 3},
      {x: 2, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 1},
    ]),
  );

  const lens = map((c) => Set(c[0].validSteps.map((t) => t.target)));

  expect(lens(cells)).toEqual(expected);
});

test('Enemy blocks path', () => {
  const path = {
    ...defaultParams,
    mapSquads: defaultParams.mapSquads
      .map((unit) => (unit.id === 'a1' ? {...unit, range: 4} : unit))
      .map((unit) => (unit.id === 'b1' ? {...unit, pos: {x: 0, y: 3}} : unit)),
  };
  const maybeCells = getPossibleMoves(path);

  const expected = Just([
    {
      steps: [
        {
          x: 0,
          y: 0,
        },
        {
          x: 0,
          y: 1,
        },
      ],
      target: {
        x: 0,
        y: 1,
      },
    },
    {
      steps: [
        {
          x: 0,
          y: 0,
        },
        {
          x: 0,
          y: 1,
        },
        {
          x: 0,
          y: 2,
        },
      ],
      target: {
        x: 0,
        y: 2,
      },
    },
  ]);

  const lens = map((c) => c[0].validSteps);

  expect(lens(maybeCells)).toEqual(expected);
});
test('Large map - performance check', () => {
  const path = {
    ...defaultParams,
    grid: Range(0, 50)
      .map((n) => Range(0, 50).map((n) => 0))
      .toJS(),
  };
  getPossibleMoves(path);
});
