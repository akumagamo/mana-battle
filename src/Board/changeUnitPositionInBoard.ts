import { makeMember, SquadRecord, updateMember } from '../Squad/Model';
import { Unit } from '../Unit/Model';
import findTileByXY from './findTileByXY';
import { Board } from './Model';
import animateUnitToBoardTile from './animateUnitToBoardTile';

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
  //todo: this same check is performed three times. we can pass the tile in a callback
  const tile = findTileByXY(board, x, y + 100);
  if (!tile) {
    animateUnitToBoardTile(board, unit.id);
  } else {
    const previousPosition = board.squad.members.get(unit.id);
    const existing = board.squad.members.find(
      (m) => m.x === tile.boardX && m.y === tile.boardY
    );

    const updatedSquad = updateMember(
      board.squad,
      makeMember({ id: unit.id, x: tile.boardX, y: tile.boardY })
    ).update('members', (members) => {
      if (existing)
        return members.update(existing.id, (member) =>
          member.set('x', previousPosition.x).set('y', previousPosition.y)
        );
      else return members;
    });

    board.squad = updatedSquad;

    onSquadUpdated(updatedSquad, [], []);

    updatedSquad.members.forEach((updatedUnit) => {
      animateUnitToBoardTile(board, updatedUnit.id);
    });
  }
};
