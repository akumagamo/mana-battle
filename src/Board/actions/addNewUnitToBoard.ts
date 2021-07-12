import { Chara } from '../../Chara/Model';
import { makeMember, updateMember } from '../../Squad/Model';
import { Unit } from '../../Unit/Model';
import { Board } from '../Model';
import renderUnit from './renderUnit';

export default (board: Board) => (unit: Unit, x: number, y: number): Chara => {
  board.units = board.units.set(unit.id, unit);
  board.squad = updateMember(board.squad, makeMember({ id: unit.id, x, y }));

  return renderUnit(board)(unit.id);
};
