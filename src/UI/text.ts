import {Container} from '../Models';
import {Scene} from 'phaser';

/**
 * WARNING: text rendering is very slow.
 * Use this in non critical areas - try to use images where possible.
 * Rendering a couple words can vary between 15ms and 60ms.
 * */
export default (
  x: number,
  y: number,
  str: string | number,
  container: Container,
  scene: Scene,
) => {
  const text = scene.add.text(
    x,
    y,
    typeof str === 'number' ? str.toString() : str,
    {
      color: '#ffffff',
      fontSize: '24px',
      fontFamily: 'sans-serif',
    },
  );

  container.add(text);
  return text;
};
