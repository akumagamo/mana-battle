import { List } from 'immutable';
import addNewUnitToBoard from '../../../Board/actions/addNewUnitToBoard';
import findTileByXY from '../../../Board/findTileByXY';
import highlightTile from '../../../Board/highlightTile';
import { Board, BoardInteractiveEvents } from '../../../Board/Model';
import { Chara } from '../../../Chara/Model';
import { GAME_SPEED } from '../../../env';
import { reposition, scaleDown } from '../../../Unit/UnitList/createUnitList';
import addUnit from '../../../Unit/UnitList/actions/addUnit';
import removeUnit from '../../../Unit/UnitList/actions/removeUnit';
import { UnitList } from '../../../Unit/UnitList/Model';
import { addMember, getMemberByPosition, SquadRecord } from '../../Model';
import removeCharaFromBoard from '../actions/removeCharaFromBoard';
import { makeUnitDragable } from '../../../Board/makeUnitsDragable';
import sortUnitsByDepth from '../../../Board/sortUnitsByDepth';

export default (
  x: number,
  y: number,
  unitList: UnitList,
  board: Board,
  chara: Chara,
  onSquadUpdated: (s: SquadRecord, added: string[], removed: string[]) => void,
  onRefresh: (cs: List<Chara>) => void,
  interactions: BoardInteractiveEvents
) => {
  // todo: the board should offer this api
  const cell = findTileByXY(board, x - board.x, y - board.y + 100);
  const { unit } = chara.props;

  if (cell) {
    const { updatedSquad, added, removed } = addMember(
      unit,
      board.squad,
      cell.boardX,
      cell.boardY
    );

    onSquadUpdated(updatedSquad, added, removed);

    const unitToReplace = getMemberByPosition({
      x: cell.boardX,
      y: cell.boardY,
    })(board.squad);

    board.squad = updatedSquad;

    //create new chara on board, representing same unit
    const newChara = addNewUnitToBoard(board)(unit, cell.boardX, cell.boardY);

    makeUnitDragable(
      newChara,
      board,
      interactions.onDragStart,
      interactions.onDragEnd,
      interactions.onSquadUpdated
    );
    //remove replaced unit
    if (unitToReplace) {
      const charaToRemove = board.unitList.find(
        (chara) => chara.props.unit.id === unitToReplace.id
      );

      if(!charaToRemove) return;

      addUnit(unitList, charaToRemove.props.unit);

      board.scene.tweens.add({
        targets: charaToRemove.container,
        y: charaToRemove.container.y - 200,
        alpha: 0,
        ease: 'Cubic',
        duration: 1000 / GAME_SPEED,
        repeat: 0,
        paused: false,
        yoyo: false,
        onComplete: () => {
          removeCharaFromBoard(board, charaToRemove);
        },
      });
    }

    //Remove dragged unit from list
    removeUnit(unitList, unit, onRefresh);

    highlightTile(board, cell);

    sortUnitsByDepth(board)

    onRefresh(List(unitList.charas));
  } else {
    reposition(unitList, chara);
    scaleDown(unitList, chara);
    board.tiles.forEach((tile) => tile.sprite.clearTint());
  }
};
