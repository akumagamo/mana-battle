import {Chara} from '../Chara';

export default (chara: Chara) => {
  const FLINCH_DURATION = 500;

  chara.parent.tweens.add({
    targets: chara?.container,
    rotation: 0.15,
    yoyo: true,
    duration: FLINCH_DURATION,
  });
};
