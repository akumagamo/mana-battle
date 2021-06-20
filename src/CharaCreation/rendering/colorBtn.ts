import { BTN_MARGIN, BTN_SIZE } from "./config";

export default function (
  scene: Phaser.Scene,
  x: number,
  y: number,
  i: number,
  c: number
) {
  const btn = scene.add.rectangle(
    x + i * (BTN_SIZE + BTN_MARGIN) + 10,
    y + 50,
    BTN_SIZE,
    BTN_SIZE
  );
  btn.setOrigin(0);

  btn.setFillStyle(c, 1);
  btn.setInteractive();

  btn.on("pointerdown", async () => {
    // emit color changed event
    btn.destroy();
  });
}
