import {Scene} from 'phaser';
import {Container} from '../Models';

export default (
  x: number,
  y: number,
  image: string,
  container: Container,
  scene: Scene,
  onClick: () => void
) => {
  const btn = scene.add.image(x,y,image)
  container.add(btn)

  btn.setInteractive();
  btn.on('pointerup', onClick)

  return btn

};
