import createUnit from '../createUnit';
import healByPercentage from './healByPercentage';

it('Should heal the unit by the expected percentage', () => {
  const unit = { ...createUnit(), currentHp: 10, hp: 100 };
  const healedUnit = healByPercentage(unit, 20);

  expect(healedUnit.currentHp).toEqual(30);
});

it('Should round the healed amount down', () => {
  const unit = { ...createUnit(), currentHp: 3, hp: 9 };
  const healedUnit = healByPercentage(unit, 50);
  expect(healedUnit.currentHp).toEqual(7);
});
