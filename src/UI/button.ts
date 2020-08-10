import {Scene} from 'phaser';
import {Container} from '../Models';

const defaultTextColor = '#ffffff'
const defaultTextSize = 28

const activeFill = 0x2c0f10
const activeTextColor = '#ffffff'

export default (
  x: number,
  y: number,
  text: string,
  container: Container,
  scene: Scene,
  onClick: () => void,
) => {
  const text_ = scene.add.text(x, y, text, {
    color: defaultTextColor,
    fontSize: `${defaultTextSize.toString()}px`,
  });
  text_.setShadow(2,2,'#000')

  const rectX = x - 15;
  const rectY = y - 10;
  const rectWidth = text_.width + 30;
  const rectHeight = text_.height + 20;

  const btn = scene.add.graphics();

  const fill = () =>
    btn.fillRect(rectX, rectY, rectWidth, rectHeight);

  const defaultFill = () =>
    btn.fillGradientStyle(0x894245, 0x562726, 0x301212, 0x2c0f10, 1);

  btn.lineStyle(2, 0xcdc0b7, 1);

  defaultFill();
  btn.strokeRect(rectX, rectY, rectWidth, rectHeight);
  fill()

  var clickZone = scene.add.zone(
    rectX,
    rectY,
    rectWidth,
    rectHeight
  );
  clickZone.setInteractive();
  clickZone.setOrigin(0);

  container.add(btn);
  container.add(text_);
  container.add(clickZone);
  clickZone.on('pointerdown', () => {
    btn.fillStyle(activeFill);
    fill();
    text_.setColor('#ffffff');
  });
  clickZone.on('pointerup', () => {
    defaultFill();
    fill();
    text_.setColor('#000000');
    scene.sound.add('click1').play();
    onClick();
  });

  clickZone.on('pointerover', () => {
    btn.fillStyle(activeFill);
    fill();
    text_.setColor(activeTextColor);
  });

  clickZone.on('pointerout', () => {
    defaultFill();
    fill();
    text_.setColor(defaultTextColor);
  });

  return btn;
};
