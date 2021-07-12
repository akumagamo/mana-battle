import panel from '../../UI/panel';
import { MapState } from '../Model';

export default function (
  scene: Phaser.Scene,
  state: MapState,
  x: number,
  y: number,
  text: string
) {
  const container = scene.add.container();
  const text_ = scene.add.text(x, y, text, {
    fontSize: '36px',
    color: '#fff',
  });
  text_.setOrigin(0.5);
  panel(
    text_.x - 20 - text_.width / 2,
    text_.y - 20 - text_.height / 2,
    text_.width + 40,
    text_.height + 40,
    container,
    scene
  );

  container.add(text_);

  state.missionContainer.add(container);

  return container;
}
