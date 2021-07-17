import tint from '../Chara/animations/tint';
import createChara from '../Chara/createChara';
import { Unit } from '../Unit/Model';
import getUnitPositionOnScreen from './getUnitPositionOnScreen';
import { Board } from './Model';

export default (board: Board, unit: Unit) => {
  const member = board.squad.members.get(unit.id);

  if(!member) return;
  const { x, y } = getUnitPositionOnScreen(member);

  const chara = createChara({
    scene: board.scene,
    unit,
    x: x * board.scale,
    y: y * board.scale,
    scale: board.scale,
    front: board.front,
    animated: false,
    showHpBar: true,
  });

  board.container.add(chara.container);

  if (chara.props.unit.currentHp < 1) tint(chara, 222222);

  return chara;
};
