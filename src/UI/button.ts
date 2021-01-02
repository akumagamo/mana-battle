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
  height?: number
) => {
  const text_ = text(x, y, label, container, scene);
  text_.setShadow(2, 2, "#000");
  text_.setColor("#fff");

  const rectX = x - 15;
  const rectY = y - 10;
  const rectWidth = width ? width : text_.width + 30;
  const rectHeight = height ? height : text_.height + 20;

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

  // const border = scene.add.graphics();
  // border.lineStyle(1, 0xffffff, 1);
  // border.strokeRect(rectX - 1, rectY - 1, rectWidth + 1, rectHeight + 2);

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
    text_.setColor("#000000");
    scene.sound.add("click1").play();
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

  return btn;
};
