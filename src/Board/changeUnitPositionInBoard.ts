import { makeMember, SquadRecord, updateMember } from '../Squad/Model';
import { Unit } from '../Unit/Model';
import findTileByXY from './findTileByXY';
import { Board } from './Model';
import moveUnitToBoardTile from './moveUnitToBoardTile';

export default (
  board: Board,
  {
    unit,
    x,
    y,
  }: {
    unit: Unit;
    x: number;
    y: number;
  },
  onSquadUpdated: (
    squad: SquadRecord,
    added: string[],
    removed: string[]
  ) => void
) => {
  console.log(`board/changeunitpositioninboard`, x, y);
  const tile = findTileByXY(board, x, y);
  if (!tile) {
    moveUnitToBoardTile(board, unit.id);
  } else {
    const updatedSquad = updateMember(
      board.squad,
      makeMember({ id: unit.id, x: tile.boardX, y: tile.boardY })
    );

    board.squad = updatedSquad;
    onSquadUpdated(updatedSquad, [], []);

    updatedSquad.members.forEach((updatedUnit) => {
      moveUnitToBoardTile(board, updatedUnit.id);
    });
  }
};
