import {Unit} from "../Model";

export default function (
  unit: Unit,
  amount: number
) {
  if (unit.currentHp === unit.hp || unit.currentHp < 1) return unit;

  const next = unit.currentHp + amount;
  if (next > unit.hp) return { ...unit, currentHp: unit.hp };
  return { ...unit, currentHp: next };
}
