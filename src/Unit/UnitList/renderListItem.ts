import createChara from '../../Chara/createChara';
import { Unit } from '../Model';
import { getRowPosition } from './actions/handleUnitDrag';
import background from './background';
import { rowOffsetX, rowOffsetY, rowWidth, rowHeight } from './constants';
import { UnitList } from './Model';

export default (unitList: UnitList, unit: Unit, index: number) => {
  const { scene, container } = unitList;

  const { x, y } = getRowPosition(container.x, container.y, index);

  const rowContainer = scene.add.container(x, y);
  rowContainer.setName('row_' + unit.id);

  container.add(rowContainer);

  var rect = new Phaser.Geom.Rectangle(
    rowOffsetX,
    rowOffsetY,
    rowWidth,
    rowHeight
  );

  const background_ = background(scene);
  background_.setInteractive(rect, Phaser.Geom.Rectangle.Contains);

  const chara = createChara({
    parent: scene,
    unit,
    x: 0,
    y: 0,
    scale: 0.5,
  });

  unitList.charas = unitList.charas.push(chara);

  const text = scene.add.text(40, 30, unit.name);

  rowContainer.add([background_, text, chara.charaWrapper]);

  return rowContainer;
};
