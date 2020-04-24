import {initiativeList} from './turns';
import {makeUnit} from '../Units/mock';

test('Should sort by initiave correctly', () => {
  const units = [
    {name: 'f1', agi: 9, dex: 9},
    {name: 'f4', agi: 6, dex: 6},
    {name: 'f3', agi: 7, dex: 7},
    {name: 'f2', agi: 8, dex: 8},
  ].map(makeUnit);

  const sorted = initiativeList(units)
    .map((unit) => unit.name)

  expect(sorted).toEqual(['f1','f2','f3','f4']);
});
