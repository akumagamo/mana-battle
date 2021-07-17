import { GAME_SPEED } from "../../env";
import text from "../../UI/text";
import { Chara } from "../Model";

export function displayDamage(chara: Chara, damage: number) {
  const dmg = text(
    -20,
    -100,
    damage.toString(),
    chara.container,
    chara.props.scene
  );
  dmg.setScale(2);
  dmg.setShadow(2, 2, "#000");
  dmg.setStroke("#000000", 4);
  dmg.setAlign("center");
  dmg.setDepth(Infinity);

  chara.props.scene.tweens.add({
    targets: dmg,
    y: dmg.y - 20,
    alpha: 0,
    duration: 1500 / GAME_SPEED,
    onComplete: () => {
      dmg.destroy();
    },
  });
}
