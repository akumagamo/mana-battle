import {Scene} from 'phaser';
import {Container} from '../Models';

export default  (
  x: number,
  y: number,
  text: string,
  container: Container,
  scene: Scene,
  onClick: () => void,
) => {
  const text_ = scene.add.text(x, y, text, {color: '#000'});
  const btn = scene.add.image(x - 15, y - 10, 'panel');
  btn.setOrigin(0, 0);
  container.add(btn);
  container.add(text_);
  btn.setInteractive();
  btn.displayWidth = text_.width + 30;
  btn.displayHeight = text_.height + 20;
  btn.on('pointerdown', () => {
    onClick();
  });
};

