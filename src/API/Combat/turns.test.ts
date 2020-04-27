import {initiativeList, runTurn} from './turns';
import {makeUnit} from '../Units/mock';

test('Should sort by initiave correctly', () => {
  const units = [
    {name: 'f1', agi: 9, dex: 9},
    {name: 'f4', agi: 6, dex: 6},
    {name: 'f3', agi: 7, dex: 7},
    {name: 'f2', agi: 8, dex: 8},
  ].map(makeUnit);

  const sorted = initiativeList(units).map((unit) => unit.name);

  expect(sorted).toEqual(['f1', 'f2', 'f3', 'f4']);
});

test('Combat should have the expected outcome', () => {
  const units = [
    {id: 'f1', squad: '1', currentHp: 100},
    {id: 'f2', squad: '1', currentHp: 100},
    {id: 'f3', squad: '1', currentHp: 100},
    {id: 'f4', squad: '2', currentHp: 31},
  ].map(makeUnit);

  const res = runTurn(0, units);

  expect(res).toStrictEqual([
      { type: 'MOVE', source: 'f1', target: 'f4' },
      { type: 'ATTACK', source: 'f1', target: 'f4' },
      { type: 'RETURN', target: 'f1'},
      { type: 'END_TURN' }
    ]
);
});
