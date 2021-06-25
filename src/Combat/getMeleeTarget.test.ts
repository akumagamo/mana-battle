import { Map } from 'immutable';
import { createSquad, makeMember, squadBuilder } from '../Squad/Model';
import { printSquad } from '../Squad/Model.test';
import { equals } from '../test/utils';
import createUnit from '../Unit/createUnit';
import { getMeleeTarget } from './getMeleeTarget';

jest.mock('../utils');
jest.mock('../Unit/mods');

test('Should get correct melee targets', () => {
  // Team 1 facing right =>
  //  [ 0, _, 1],
  //  [ _, _, 2],
  //  [ 4, _, 3],
  //
  // Team 2 facing right =>
  //  [ _, _, 6],
  //  [ _, 5, 7],
  //  [ _, _, 8],
  //
  // After transposing:
  //  [ 0, _, 1, 8, _, _],
  //  [ _, _, 2, 7, 5, _],
  //  [ 4, _, 3, 6, _, _],
  //
  // 0 -> 8
  // 1 -> 8
  // 2 -> 7
  // 3 -> 6
  // 4 -> 6

  const squadIndex = Map({
    '1': createSquad({
      id: '1',
      force: 'player',
      leader: '0',
      members: Map({
        '0': makeMember({ id: '0', x: 1, y: 1 }),
        '1': makeMember({ id: '1', x: 3, y: 1 }),
        '2': makeMember({ id: '2', x: 3, y: 2 }),
        '3': makeMember({ id: '3', x: 3, y: 3 }),
        '4': makeMember({ id: '4', x: 1, y: 3 }),
      }),
    }),
    '2': createSquad({
      id: '2',
      force: 'cpu',
      leader: '5',
      members: Map({
        '5': makeMember({ id: '5', x: 2, y: 2 }),
        '6': makeMember({ id: '6', x: 3, y: 1 }),
        '7': makeMember({ id: '7', x: 3, y: 2 }),
        '8': makeMember({ id: '8', x: 3, y: 3 }),
      }),
    }),
  });

  const unitIndex = Map({
    '0': { ...createUnit('0'), squad: '1' },
    '1': { ...createUnit('1'), squad: '1' },
    '2': { ...createUnit('2'), squad: '1' },
    '3': { ...createUnit('3'), squad: '1' },
    '4': { ...createUnit('4'), squad: '1' },
    '5': { ...createUnit('5'), squad: '2' },
    '6': { ...createUnit('6'), squad: '2' },
    '7': { ...createUnit('7'), squad: '2' },
    '8': { ...createUnit('8'), squad: '2' },
  });

  const targetOf = (id: string) =>
    getMeleeTarget(unitIndex.get(id), unitIndex, squadIndex).id;

  equals(targetOf('0'), '8');
  equals(targetOf('1'), '8');
  equals(targetOf('2'), '7');
  equals(targetOf('3'), '6');
  equals(targetOf('4'), '6');
});

test('Should choose closer enemy on diagonal', () => {
  // Team 1 facing right =>
  //  [ _, _, 0],
  //  [ _, _, _],
  //  [ _, _, _],
  //
  // Team 2 facing right =>
  //  [ _, _, _],
  //  [ _, _, 3],
  //  [ 2, _, _],
  //
  // After transposing:
  //  [ _, _, 1, _, _, 2],
  //  [ _, _, _, 3, _, _],
  //  [ _, _, _, _, _, _],
  //
  // 1 -> 3

  const squadIndex = Map({
    '1': squadBuilder({
      id: '1',
      force: 'player',
      leader: '0',
      members: [['0', 3, 1]],
    }),
    '2': squadBuilder({
      id: '2',
      force: 'cpu',
      leader: '1',
      members: [
        ['1', 2, 2],
        ['2', 1, 3],
        ['3', 3, 2],
      ],
    }),
  });

  const unitIndex = Map({
    '0': { ...createUnit('0'), squad: '1' },
    '1': { ...createUnit('1'), squad: '2' },
    '2': { ...createUnit('2'), squad: '2' },
    '3': { ...createUnit('3'), squad: '2' },
  });

  const targetOf = (id: string) =>
    getMeleeTarget(unitIndex.get(id), unitIndex, squadIndex).id;

  equals(targetOf('0'), '3');
});
