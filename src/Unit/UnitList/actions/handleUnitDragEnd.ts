import { Chara } from '../../../Chara/Model';
import { UnitList } from '../Model';
import { pageControls } from '../pageControls';

export default (unitList: UnitList, chara: Chara, x: number, y: number) => {
  pageControls(unitList);
  console.log(`todo: on drag end`);
  //if (unitList.onDragEnd) unitList.onDragEnd(chara, x, y);
};
