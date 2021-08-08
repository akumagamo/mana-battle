import createChara from '../../Chara/createChara';
import { CharaCreationState } from '../Model';

export default function (scene: Phaser.Scene, state: CharaCreationState) {
  const {unit} = state
  state.chara.destroy();
  state.container.remove(state.chara.container);

  state.chara = createChara({
    scene,
    unit,
    x: 250,
    y: 250,
    scale: 3,
  });
}
