// @ts-nocheck

import {getPossibleMoves} from './api';
import {Range, Set, fromJS} from 'immutable';
import {TurnManager} from './Model';
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
      members: {},
      status: 'alive',
    },
  ],
};

test('Get moves in straight line', () => {
  const cells = getPossibleMoves(defaultParams);

  const lens = (c) => c[0].validSteps.map((t) => t.target).toJS();

  const expected = [
    {x: 0, y: 1},
    {x: 0, y: 2},
  ];

  expect(lens(cells)).toEqual(expected);
});

test('Make a turn', () => {
  const longerRange = {
    ...defaultParams,

    mapSquads: defaultParams.mapSquads.map((unit) =>
      unit.id === 'a1' ? {...unit, range: 4} : unit,
    ),
  };
  const moves = getPossibleMoves(longerRange);

  const lens = (c) => c[0].validSteps.map((t) => t.target).toJS();

  const expected = [
    {x: 0, y: 1},
    {x: 0, y: 2},
    {x: 0, y: 3},
    {x: 1, y: 3},
  ];

  expect(lens(moves)).toEqual(expected);
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
  const moves = getPossibleMoves(path);

  const lens = (c) => c[0].validSteps.map((t) => t.target).toJS();
  const expected = [
    {x: 0, y: 1},
    {x: 0, y: 2},
  ];

  expect(lens(moves)).toEqual(expected);
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
  const moves = getPossibleMoves(path);

  const expected = Set(
    [
      {x: 0, y: 1},
      {x: 0, y: 2},
      {x: 0, y: 3},
      {x: 1, y: 1},
      {x: 1, y: 3},
      {x: 2, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 1},
    ].map((v) => fromJS(v)),
  );

  const result = Set(
    fromJS(moves[0].validSteps.map((t) => t.target).map((v) => fromJS(v))),
  );

  expect(result.equals(expected)).toBe(true);
});

test('Enemy blocks path', () => {
  const path = {
    ...defaultParams,
    mapSquads: defaultParams.mapSquads
      .map((unit) => (unit.id === 'a1' ? {...unit, range: 4} : unit))
      .map((unit) => (unit.id === 'b1' ? {...unit, pos: {x: 0, y: 3}} : unit)),
  };
  const moves = getPossibleMoves(path);

  const expected = [
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
  ];

  const result = moves[0].validSteps.toJS();

  expect(fromJS(result).equals(fromJS(expected))).toBe(true);
  //expect(result).toEqual(expected);
});
test('Large map - performance check', () => {
  const path = {
    ...defaultParams,
    grid: Range(0, 50)
      .map(() => Range(0, 50).map(() => 0))
      .toJS(),
  };
  getPossibleMoves(path);
});
