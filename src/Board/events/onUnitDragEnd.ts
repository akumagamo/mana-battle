import BoardScene, { getUnitPositionInScreen } from '../InteractiveBoardScene';
import { BoardTile } from '../Model';
import * as Squad from '../../Squad/Model';
import { Chara } from '../../Chara/Model';

export default (board: BoardScene) => (chara: Chara) => (
  x: number,
  y: number
) => {
  const {
    props: { unit },
  } = chara;
  const { squad } = board;

  const boardSprite = board.findTileByXY(x, y);

  const squadMember = Squad.getMember(unit.id, squad);

  if (!squadMember)
    throw new Error('Invalid state. Unit should be in board object.');

  const isMoved = (boardSprite: BoardTile) =>
    squadMember.x !== boardSprite.boardX ||
    squadMember.y !== boardSprite.boardY;

  if (boardSprite && isMoved(boardSprite)) {
    board.changeUnitPositionInBoard({
      unit,
      x: boardSprite.boardX,
      y: boardSprite.boardY,
    });
  } else {
    const { x, y } = getUnitPositionInScreen(squadMember);

    // return to original position
    board.tweens.add({
      targets: board.getChara(unit)?.container,
      x: x,
      y: y,
      ease: 'Cubic',
      duration: 400,
      repeat: 0,
      paused: false,
      yoyo: false,
    });
    board.tiles.forEach((sprite) => {
      if (sprite.boardX === squadMember.x && sprite.boardY === squadMember.y)
        board.highlightTile(sprite);
      else sprite.sprite.clearTint();
    });
  }
};
