import { Unit } from "../Model";

export default function (unit: Unit, amount: number) {
  if (unit.currentHp < unit.hp) {
    const next = unit.currentHp + amount;
    if (next > unit.hp) return { ...unit, currentHp: unit.hp };
    else return { ...unit, currentHp: next };
  } else return unit;
}
