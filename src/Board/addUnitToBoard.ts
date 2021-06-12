import tint from '../Chara/animations/tint';
import createChara from '../Chara/createChara';
import { Unit } from '../Unit/Model';
import { getUnitPositionInScreen } from './InteractiveBoardScene';
import { StaticBoard } from './Model';

export default (board: StaticBoard, unit: Unit) => {
  if (!unit.squad) return;

  const pos = board.squad.members.get(unit.id);

  let { x, y } = getUnitPositionInScreen(pos);

  x = x * board.scale + board.x;
  y = y * board.scale + board.y;

  const chara = createChara({
    parent: this,
    unit,
    x: x,
    y: y,
    scale: board.scale,
    front: board.front,
    animated: false,
    showHpBar: true,
  });

  if (chara.props.unit.currentHp < 1) tint(chara, 222222);

  return chara;
};
