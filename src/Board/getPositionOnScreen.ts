import { Vector } from 'matter';
import { invertBoardPosition } from '../Squad/Model';
import { cartesianToIsometric } from '../utils/isometric';
import { Board } from './Model';

export default (board: Board, squadMember: Vector) => {
  const x_ = board.front ? squadMember.x : invertBoardPosition(squadMember.x);
  const y_ = board.front ? squadMember.y : invertBoardPosition(squadMember.y);

  const { x, y } = cartesianToIsometric(x_, y_);

  return { x, y: y - 230 };
};
