import { Unit } from "../Model";
import healUnit from "./healUnit";

export default function (unit:Unit, percentage: number) {
  const amount = Math.floor((unit.hp / 100) * percentage);

  return healUnit(unit, amount);
}
