import { PLAYER_FORCE } from '../../constants';
import { Chara } from '../Model';

export const addInsignea = (chara: Chara) => {
  const emblem = chara.scene.add.image(
    100,
    -20,
    chara.props.unit.force === PLAYER_FORCE ? 'ally_emblem' : 'enemy_emblem'
  );

  emblem.name = 'emblem';

  chara.container.add(emblem);
};
