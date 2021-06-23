import { destroyImage } from "../../Browser/phaser";
import { Chara } from "../Model";

export default function (chara: Chara) {
  if (chara.selectedCharaIndicator) {
    destroyImage(chara.selectedCharaIndicator);
    chara.selectedCharaIndicator = null;
  }
}
