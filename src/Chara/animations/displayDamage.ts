import text from "../../UI/text";
import { Chara } from "../Model";

const GAME_SPEED = parseInt(process.env.SPEED);
export function displayDamage(chara: Chara, damage: number) {
  const dmg = text(
    chara.container.x - 20,
    chara.container.y - 100,
    damage.toString(),
    chara.charaWrapper,
    chara.props.parent
  );
  dmg.setScale(2);
  //dmg.setShadow(2, 2, '#000');
  dmg.setStroke("#000000", 4);
  dmg.setAlign("center");

  chara.props.parent.tweens.add({
    targets: dmg,
    y: chara.container.y - 120,
    alpha: 0,
    duration: 3000 / GAME_SPEED,
    ease: "Expo",
    onComplete: () => dmg.destroy(),
  });
}
