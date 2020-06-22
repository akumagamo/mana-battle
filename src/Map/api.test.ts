// @ts-nocheck

import {getPossibleMoves} from './api';
import S from 'sanctuary';
const defaultParams = {
  currentForce: 'a',
  forces: [
    {id: 'a', units: ['a1']},
    {id: 'b', units: ['b1']},
  ],
  grid: [
    [0, 1, 1, 1, 1],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
  ],
  height: 5,
  width: 5,
  walkableCells: [0],
  units: [
    {id: 'a1', pos: {x: 0, y: 0}, validSteps: [], range: 2, force: 'a'},
    {id: 'b1', pos: {x: 3, y: 3}, validSteps: [], range: 2, force: 'b'},
  ],
};

test('Get moves in straight line', () => {
  const cells = getPossibleMoves(defaultParams);

  const steps = cells[0].validSteps;
  const expected = [
    {x: 0, y: 1},
    {x: 0, y: 2},
  ];
  expect(steps).toEqual(expected);
});

test('Make a turn', () => {
  const longerRange = {
    ...defaultParams,

    units: defaultParams.units.map((unit) =>
      unit.id === 'a1' ? {...unit, range: 4} : unit,
    ),
  };
  const cells = getPossibleMoves(longerRange);

  expect(cells[0].validSteps).toEqual([
    {x: 0, y: 1},
    {x: 0, y: 2},
    {x: 0, y: 3},
    {x: 1, y: 3},
  ]);
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

    units: defaultParams.units.map((unit) =>
      unit.id === 'a1' ? {...unit, range: 4} : unit,
    ),
  };
  const cells = getPossibleMoves(path);

  expect(cells[0].validSteps).toEqual([
    {x: 0, y: 1},
    {x: 0, y: 2},
  ]);
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

    units: defaultParams.units.map((unit) =>
      unit.id === 'a1' ? {...unit, range: 4} : unit,
    ),
  };
  const cells = getPossibleMoves(path);
  expect(cells[0].validSteps).toEqual([
    {x: 0, y: 1},
    {x: 0, y: 2},
    {x: 0, y: 3},
    {x: 1, y: 1},
    {x: 1, y: 3},
    {x: 2, y: 1},
    {x: 2, y: 2},
    {x: 3, y: 1},
  ]);
});

test('Enemy blocks path', () => {
  const path = {
    ...defaultParams,
    units: defaultParams.units
      .map((unit) => (unit.id === 'a1' ? {...unit, range: 4} : unit))
      .map((unit) => (unit.id === 'b1' ? {...unit, pos: {x: 0, y: 3}} : unit)),
  };
  const cells = getPossibleMoves(path);
  const expected = [
    {x: 0, y: 1},
    {x: 0, y: 2},
  ];
  expect(cells[0].validSteps).toEqual(expected);
});
