import { MemberRecord } from '../Squad/Model';
import { cartesianToIsometric } from '../utils/isometric';

export default (squadMember: MemberRecord) => {
  const { x, y } = cartesianToIsometric(squadMember.x, squadMember.y);

  //FIXME: unit should be rendered at origin 0.5
  return { x, y: y - 230 };
};
