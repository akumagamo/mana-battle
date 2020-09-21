import {initiativeList, runCombat} from './turns';
import {Unit, assignSquad} from '../../Unit/Model';
import {getUnitAttack} from '../../Unit/Skills';
import {makeUnit} from '../../Unit/Jobs';

function makeTurnUnit(unit: Unit) {
  return {remainingAttacks: getUnitAttack(unit).times, unit};
}

test('Should sort by initiave correctly', () => {
  const units = [
    {...makeUnit('fighter', 1, 1), dex: 9},
    {...makeUnit('fighter', 1, 1), dex: 6},
    {...makeUnit('fighter', 1, 1), dex: 7},
    {...makeUnit('fighter', 1, 1), dex: 8},
  ].map(makeTurnUnit);

  const sorted = initiativeList(units).map((unit) => unit.unit.id);

  expect(sorted).toEqual(['0', '3', '2', '1']);
});

test('Combat should have the expected outcome', () => {
  const units = [
    assignSquad(makeUnit('fighter', 1, 1), {id: '1', x: 1, y: 2}),
    assignSquad(makeUnit('fighter', 1, 1), {id: '1', x: 2, y: 2}),
    assignSquad(makeUnit('fighter', 1, 1), {id: '1', x: 3, y: 2}),
    assignSquad(makeUnit('fighter', 1, 1), {id: '2', x: 2, y: 2}),
  ]

  const res = runCombat(units);

  const last = res.reverse()[0];

  expect(last.type).toBe('VICTORY');
});
