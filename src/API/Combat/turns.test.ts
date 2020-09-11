import {initiativeList, runCombat} from './turns';
import {makeUnit} from '../Units/mock';
import {Unit} from '../../Unit/Model';
import {getUnitAttack} from '../../Unit/Skills';
import {fighter} from '../../Unit/Jobs';

function makeTurnUnit(unit: Unit) {
  return {remainingAttacks: getUnitAttack(unit).times, unit};
}

test('Should sort by initiave correctly', () => {

  const units = [
    {...fighter(0,1,1), dex: 9 },
    {...fighter(1,1,1), dex: 6 },
    {...fighter(2,1,1), dex: 7 },
    {...fighter(3,1,1), dex: 8 }
  ]
    .map(makeTurnUnit);

  const sorted = initiativeList(units).map((unit) => unit.unit.id);

  expect(sorted).toEqual(['0', '3', '2', '1']);
});

test('Combat should have the expected outcome', () => {
  const units = [
    fighter(0,1,1) ,
    fighter(1,1,1) ,
    fighter(2,1,1) ,
    fighter(3,2,1) 
  ].map(makeUnit);

  const res = runCombat(units);

  const last = res.reverse()[0];

  expect(last.type).toBe('VICTORY');
});
