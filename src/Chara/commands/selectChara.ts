import {createImage} from "../../Browser/phaser";
import {Chara} from "../Model";

export default function (chara:Chara){

  const selected =  createImage( chara.scene, "chara/selected_chara", 0 , 100)
  selected.setScale(0.5)

  chara.selectedCharaIndicator = selected;
  chara.container.add(selected)
  chara.container.sendToBack(selected)

}
