import { displayDamage } from "../../Chara/animations/displayDamage";
import { Chara } from "../../Chara/Model";
import hpBar from "../../Chara/ui/hpBar";

export default async function damageUnit(
  chara: Chara,
  newHp: number,
  damage: number
) {
  if (chara.showHpBar) hpBar(chara, newHp);

  chara.hit();

  displayDamage(chara, damage);
}
