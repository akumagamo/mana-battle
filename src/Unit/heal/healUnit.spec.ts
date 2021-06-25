import { makeUnit } from '../makeUnit';
import healUnit from './healUnit';

it('Should heal the unit by the expected amount', () => {
  const unit = { ...makeUnit(), currentHp: 10 };
  const amount = 20;
  const healedUnit = healUnit(unit, amount);

  expect(healedUnit.currentHp).toEqual(30);
});

it('Should not heal beyond the maximum hp', () => {
  const unit = { ...makeUnit(), currentHp: 10, hp: 30 };
  const amount = 40;
  const healedUnit = healUnit(unit, amount);

  expect(healedUnit.currentHp).toEqual(30);

  expect(healedUnit.hp).toEqual(30);
});

it('Should not a dead unit', () => {
  const unit = { ...makeUnit(), currentHp: 0, hp: 30 };
  const amount = 40;
  const healedUnit = healUnit(unit, amount);

  expect(healedUnit.currentHp).toEqual(0);
});
