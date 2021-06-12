import tint from '../Chara/animations/tint';
import createChara from '../Chara/createChara';
import { Unit } from '../Unit/Model';
import { getUnitPositionInScreen } from './InteractiveBoardScene';
import { StaticBoard } from './Model';

export default (board: StaticBoard, unit: Unit) => {
  const pos = board.squad.members.get(unit.id);

  let { x, y } = getUnitPositionInScreen(pos);

  x = x * board.scale;
  y = y * board.scale;

  const chara = createChara({
    parent: board.scene,
    unit,
    x: x,
    y: y,
    scale: board.scale,
    front: board.front,
    animated: false,
    showHpBar: true,
  });

  board.container.add(chara.charaWrapper);

  if (chara.props.unit.currentHp < 1) tint(chara, 222222);

  return chara;
};
