import { Scene } from "phaser";
import { Container } from "../Models";
import text from "./text";

const defaultTextColor = "#ffffff";
const activeFill = 0x222222;
const activeTextColor = "#ffffff";

export default (
  x: number,
  y: number,
  label: string,
  container: Container,
  scene: Scene,
  onClick: () => void,
  disabled = false,
  width?: number,
  height?: number,
  active?: boolean
) => {


  const w = width ? width : 170;
  const h = height ? height : 40;

  const text_ = text(x + (w / 2), y + (h/2), label, container, scene);
  text_.setOrigin(0.5)
  text_.setShadow(2, 2, "#000");
  text_.setColor("#fff");

  const rectX = x;
  const rectY = y;
  const rectWidth = w;
  const rectHeight = h;

  const btn = scene.add.graphics();

  const fill = () => btn.fillRect(rectX, rectY, rectWidth, rectHeight);

  const defaultFill = () => {
    if (!disabled)
      btn.fillGradientStyle(0x000000, 0x222222, 0x000000, 0x444444, 0.8);
    else btn.fillGradientStyle(0x888888, 0x888888, 0x888888, 0x888888, 1);
  };
  btn.lineStyle(2, 0xcdc0b7, 1);

  defaultFill();
  btn.strokeRect(rectX, rectY, rectWidth, rectHeight);
  fill();

  const border = scene.add.graphics();
  if (active) {
    border.lineStyle(4, 0xd4af37, 1);
    border.strokeRect(rectX - 1, rectY - 1, rectWidth + 1, rectHeight + 2);
  }
  const clickZone = scene.add.zone(rectX, rectY, rectWidth, rectHeight);
  clickZone.setInteractive();
  clickZone.setOrigin(0);

  container.add(btn);
  container.bringToTop(text_);

  container.add(clickZone);

  clickZone.on("pointerdown", () => {
    if (disabled) return;
    btn.fillStyle(activeFill);
    fill();
    text_.setColor("#ffffff");
  });
  clickZone.on("pointerup", () => {
    if (disabled) return;
    defaultFill();
    fill();
    if (process.env.SOUND_ENABLED) scene.sound.add("click1").play();
    clickZone.removeAllListeners();
    onClick();
  });

  clickZone.on("pointerover", () => {
    if (disabled) return;
    btn.fillStyle(activeFill);
    fill();
    text_.setColor(activeTextColor);
  });

  clickZone.on("pointerout", () => {
    if (disabled) return;
    defaultFill();
    fill();
    text_.setColor(defaultTextColor);
  });

  const elems = [text_, btn, clickZone, border];

  return { btn, destroy: () => elems.map((e) => e.destroy()) };
};

export const setActive = (btn: Phaser.GameObjects.Graphics) => {
  console.log(`setting active`);
  btn.fillStyle(activeFill);
  btn.fill();
};
