import createChara from '../../Chara/createChara';
import { Unit } from '../Model';
import { getRowPosition } from './actions/getRowPosition';
import background from './background';
import { rowOffsetX, rowOffsetY, rowWidth, rowHeight } from './constants';
import { UnitList } from './Model';

export default (unitList: UnitList, unit: Unit, index: number) => {
  const { scene, container } = unitList;

  const { x, y } = getRowPosition(container.x, container.y, index);

  const rowContainer = scene.add.container();
  rowContainer.setName('row_' + unit.id);

  container.add(rowContainer);

  const background_ = background(scene);
  background_.setPosition(x,y)

  const chara = createChara({
    parent: scene,
    unit,
    x,
    y,
    scale: 0.5,
  });

  unitList.charas = unitList.charas.push(chara);

  const text = scene.add.text(x + 40, y +30, unit.name);

  rowContainer.add([background_, text, chara.container]);

  return rowContainer;
};
