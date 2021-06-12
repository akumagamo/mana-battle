import { Vector } from 'matter';
import { invertBoardPosition } from '../Squad/Model';
import { cartesianToIsometric } from '../utils/isometric';
import { StaticBoard } from './Model';

export default (board: StaticBoard, squadMember: Vector) => {
  const x_ = board.front ? squadMember.x : invertBoardPosition(squadMember.x);
  const y_ = board.front ? squadMember.y : invertBoardPosition(squadMember.y);

  const { x, y } = cartesianToIsometric(x_, y_);

  return { x, y: y - 230 };
};
