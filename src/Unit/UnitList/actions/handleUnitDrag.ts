import { scaleUp } from '..';
import { Chara } from '../../../Chara/Model';
import { Unit } from '../../Model';
import { UnitList } from '../Model';

export default (
  unitList: UnitList,
  unit: Unit,
  x: number,
  y: number,
  chara: Chara,
  onDrag: (chara: Unit, x: number, y: number) => void
) => {
  scaleUp(unitList.scene, chara);
  onDrag(unit, x, y);
};
export function getRowPosition(x: number, y: number, index: number) {
  const lineHeight = 100;
  return {
    x,
    y: y + lineHeight * index,
  };
}
