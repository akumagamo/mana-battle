import BoardScene, { getUnitPositionInScreen } from '../InteractiveBoardScene';
import { BoardTile, StaticBoard } from '../Model';
import * as Squad from '../../Squad/Model';
import { Chara } from '../../Chara/Model';
import findTileByXY from '../findTileByXY';
import changeUnitPositionInBoard from '../changeUnitPositionInBoard';
import highlightTile from '../highlightTile';

export default (board: StaticBoard) => (chara: Chara) => (
  x: number,
  y: number,
  onSquadUpdated: () => void
) => {
  const {
    props: { unit },
  } = chara;
  const { squad } = board;

  const boardSprite = findTileByXY(board, x, y);

  const squadMember = Squad.getMember(unit.id, squad);

  if (!squadMember)
    throw new Error('Invalid state. Unit should be in board object.');

  const isMoved = (boardSprite: BoardTile) =>
    squadMember.x !== boardSprite.boardX ||
    squadMember.y !== boardSprite.boardY;

  if (boardSprite && isMoved(boardSprite)) {
    changeUnitPositionInBoard(
      board,
      {
        unit,
        x: boardSprite.boardX,
        y: boardSprite.boardY,
      },
      onSquadUpdated
    );
  } else {
    const { x, y } = getUnitPositionInScreen(squadMember);

    // return to original position
    board.scene.tweens.add({
      targets: board.unitList.find((u) => u.id === unit.id).container,
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
        highlightTile(board, sprite);
      else sprite.sprite.clearTint();
    });
  }
};
