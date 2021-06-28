import { Container } from '../../Models';
import panel from '../../UI/panel';
import text from '../../UI/text';
import { CharaCreationState } from '../Model';


export default function (
  scene: Phaser.Scene,
  container: Container,
  label: string,
  width: number,
  height: number
) {
  const panel_ = panel(
    0,
    0,
    width,
    height,
    container,
    scene
  ).setAlpha(0.6);
  const text_ = text(10, 10, label, container, scene);

  return {
    destroy: () => {
      panel_.destroy();
      text_.destroy();
    },
  };
}
