import { displayDamage } from "../../Chara/animations/displayDamage";
import { Chara } from "../../Chara/Model";
import hpBar from "../../Chara/ui/hpBar";

export default async function damageUnit(chara: Chara, damage: number) {
  if (chara.showHpBar) hpBar(chara, damage);

  chara.hit();

  displayDamage(chara, damage);
}
