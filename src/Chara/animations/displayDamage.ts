import text from "../../UI/text";
import { Chara } from "../Model";

const GAME_SPEED = parseInt(process.env.SPEED);
export function displayDamage(chara: Chara, damage: number) {
  const container = chara.scene.add.container(
    chara.container.x,
    chara.container.y
  );
  const dmg = text(-20, -100, damage.toString(), container, chara.scene);
  dmg.setScale(2);
  // Phaser bug: stroke and shadow make tween not completeable
  // dmg.setShadow(2, 2, "#000");
  // dmg.setStroke("#000000", 4);
  dmg.setAlign("center");

  chara.scene.tweens.add({
    targets: dmg,
    y: -40,
    alpha: 0,
    duration: 1000 / GAME_SPEED,
    ease: "Expo",
    onComplete: () => {
      container.destroy();
      dmg.destroy();
    },
  });
}
