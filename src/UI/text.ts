import {Container} from '../Models';
import {Scene} from 'phaser';

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
      color: '#000',
      fontSize: "24px",
      fontFamily : "Alata"
    },
  );

  container.add(text);
  return text
};
