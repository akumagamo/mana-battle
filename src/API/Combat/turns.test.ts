import {initiativeList, runCombat} from './turns';
import {makeUnit} from '../Units/mock';
import {Unit} from '../../Unit/Model';

function makeTurnUnit (unit:Unit){

  return { remainingAttacks: 2, unit}

}

test('Should sort by initiave correctly', () => {
  const units = [
    {name: 'f1', agi: 9, dex: 9},
    {name: 'f4', agi: 6, dex: 6},
    {name: 'f3', agi: 7, dex: 7},
    {name: 'f2', agi: 8, dex: 8},
  ].map(makeUnit).map(makeTurnUnit);

  const sorted = initiativeList(units).map((unit) => unit.unit.name);

  expect(sorted).toEqual(['f1', 'f2', 'f3', 'f4']);
});

test('Combat should have the expected outcome', () => {
  const units = [
    {id: 'f1', squad: '1', currentHp: 100},
    {id: 'f2', squad: '1', currentHp: 100},
    {id: 'f3', squad: '1', currentHp: 100},
    {id: 'f4', squad: '2', currentHp: 100},
  ].map(makeUnit);

  const res = runCombat(units);

  const last = res.reverse()[0]

  expect(last.type).toBe( "VICTORY")
  
});
