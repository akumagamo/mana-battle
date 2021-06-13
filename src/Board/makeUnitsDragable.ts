import onEnableDrag from '../Chara/events/onEnableDrag';
import { Chara } from '../Chara/Model';
import { SquadRecord } from '../Squad/Model';
import { Unit } from '../Unit/Model';
import changeUnitPositionInBoard from './changeUnitPositionInBoard';
import onUnitDrag from './events/onUnitDrag';
import { StaticBoard } from './Model';

export default (
  board: StaticBoard,
  onSquadUpdated: (
    squad: SquadRecord,
    added: string[],
    removed: string[]
  ) => void,
  onDragStart?: (unit: Unit, x: number, y: number, chara: Chara) => void,
  onDragEnd?: (chara: Chara) => (x: number, y: number) => void
) => {
  board.unitList.forEach((chara) => {
    onEnableDrag(
      chara,
      (u, x, y, chara) => {
        onUnitDrag(board)(u, x, y);

        if (onDragStart) onDragStart(u, x, y, chara);
      },
      (c) => (x, y) => {
        changeUnitPositionInBoard(
          board,
          { unit: c.props.unit, x, y },
          onSquadUpdated
        );

        if (onDragEnd) onDragEnd(c)(x, y);
      }
    );
  });
};
