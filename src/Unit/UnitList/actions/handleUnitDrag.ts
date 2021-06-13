import { scaleUp } from '..';
import { Chara } from '../../../Chara/Model';
import { Unit } from '../../Model';
import { UnitList } from '../Model';

export default (
  unitList: UnitList,
  unit: Unit,
  x: number,
  y: number,
  chara: Chara
) => {
  scaleUp(unitList.scene, chara);
  return unitList.onDrag(unit, x, y);
};
export function getRowPosition(x: number, y: number, index: number) {
  const lineHeight = 100;
  return {
    x,
    y: y + lineHeight * index,
  };
}
