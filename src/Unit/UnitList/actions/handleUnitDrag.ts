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
  if (chara.container.scale === 0.5) scaleUp(unitList.scene, chara);
  onDrag(unit, x, y);
};
