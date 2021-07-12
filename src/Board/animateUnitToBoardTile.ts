import { getMember } from '../Squad/Model';
import getUnitPositionOnScreen from './getUnitPositionOnScreen';
import { Board } from './Model';
import sortUnitsByDepth from './sortUnitsByDepth';

export default (board: Board, id: string) => {
  const chara = board.unitList.find((chara) => chara.id === id);

  const { unit } = chara.props;

  const pos = getUnitPositionOnScreen(getMember(unit.id, board.squad));

  const tween = board.scene.tweens.add({
    targets: chara?.container,
    x: pos.x,
    y: pos.y,
    ease: 'Cubic',
    duration: 400,
    repeat: 0,
    paused: false,
    yoyo: false,
  });

  tween.on('complete', () => {
    sortUnitsByDepth(board);
  });
};
