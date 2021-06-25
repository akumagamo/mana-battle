import { initiativeList, runCombat } from './turns';
import { assignSquad } from '../Unit/Model';
import { makeUnit } from '../Unit/makeUnit';
import { createSquad, makeMember } from '../Squad/Model';
import { List, Map } from 'immutable';
import { equals } from '../test/utils';

jest.mock('../utils/random');
jest.mock('../Unit/mods');

test('Should sort by initiave correctly', () => {
  const units = Map({
    '0': { ...makeUnit('0'), dex: 9 },
    '1': { ...makeUnit('1'), dex: 6 },
    '2': { ...makeUnit('2'), dex: 7 },
    '3': { ...makeUnit('3'), dex: 8 },
  });

  const sorted = initiativeList(units);

  equals(sorted, List(['0', '3', '2', '1']));
});

test('Combat should have the expected outcome', () => {
  const units = Map({
    '0': assignSquad(makeUnit('0'), 's1'),
    '1': assignSquad(makeUnit('1'), 's1'),
    '2': assignSquad(makeUnit('2'), 's1'),
    '3': assignSquad(makeUnit('3'), 's2'),
  });

  const squadIndex = Map({
    s1: createSquad({
      id: 's1',
      leader: '0',
      force: 'player',
      members: Map({
        '0': makeMember({ id: '0', x: 1, y: 2 }),
        '1': makeMember({ id: '1', x: 2, y: 2 }),
        '2': makeMember({ id: '2', x: 3, y: 2 }),
      }),
    }),
    s2: createSquad({
      id: 's2',
      leader: '3',
      force: 'cpu',
      members: Map({
        '3': makeMember({ id: '3', x: 1, y: 2 }),
      }),
    }),
  });

  const res = runCombat(squadIndex, units);
  equals(res.length, 25);

  const [last] = res.reverse();
  equals(last.type, 'END_COMBAT');
});
