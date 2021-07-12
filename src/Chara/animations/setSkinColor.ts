import { Chara } from '../Model';

export default (chara: Chara, value: number) => {
  chara.head.setTint(value);
  chara.leftHand.setTint(value);
  chara.rightHand.setTint(value);
  chara.leftFoot.setTint(value);
  chara.rightFoot.setTint(value);
};
