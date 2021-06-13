import onEnableDrag from '../Chara/events/onEnableDrag';
import { Chara } from '../Chara/Model';
import { SquadRecord } from '../Squad/Model';
import { Unit } from '../Unit/Model';
import changeUnitPositionInBoard from './changeUnitPositionInBoard';
import { StaticBoard } from './Model';

export default (
  board: StaticBoard,
  onSquadUpdated: (
    squad: SquadRecord,
    added: string[],
    removed: string[]
  ) => void,
  onDragStart: (unit: Unit, x: number, y: number, chara: Chara) => void,
  onDragEnd: (chara: Chara) => (x: number, y: number) => void
) => {
  board.unitList.forEach((chara) => {
    onEnableDrag(chara, onDragStart, (c) => (x, y) => {
      changeUnitPositionInBoard(
        board,
        { unit: c.props.unit, x, y },
        onSquadUpdated
      );

      onDragEnd(c)(x, y);
    });
  });
};

function onSquadUpdated(
  board: any,
  arg1: { unit: Unit; x: number; y: number },
  onSquadUpdated: any
) {
  throw new Error('Function not implemented.');
}
