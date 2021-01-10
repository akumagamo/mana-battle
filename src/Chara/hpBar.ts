import { Container } from "../Models";
import text from "../UI/text";

export default (
  scene: Phaser.Scene,
  parent: Container,
  hpAmount: number,
  maxHp: number
) => {
  const x = -50;
  const y = -40;

  const container = scene.add.container(x, y);

  parent.add(container);

  const width = 100;
  const height = 16;
  const borderWidth = 2;

  const hpBar = new Phaser.GameObjects.Graphics(scene);
  container.add(hpBar);

  hpBar.fillStyle(0x000000);
  hpBar.fillRect(0, 0, width + borderWidth * 2, height + borderWidth * 2);

  hpBar.fillStyle(0xffffff);
  hpBar.fillRect(borderWidth, borderWidth, width, height);

  hpBar.fillStyle(0x00ff00);

  var fillSize = Math.floor(width * (hpAmount / maxHp));

  hpBar.fillRect(borderWidth, borderWidth, fillSize, height);

  const hp = text(30, -50, hpAmount, container, scene);
  hp.setStyle({ fontStyle: "bold", align: "center" });
  container.add(hp);

  hp.setColor("#ffffff");
  hp.setStroke("#000000", 6);
  hp.setFontSize(50);

  return container;
};
