import {PLAYER_FORCE} from '../../constants';
import {Chara} from '../Model';

export const addInsignea = (chara: Chara) => {
  const emblem = chara.scene.add.image(
    40,
    -20,
    chara.unit.force === PLAYER_FORCE ? 'ally_emblem' : 'enemy_emblem',
  );

  emblem.setScale(0.3)

  chara.container.add(emblem);
};
