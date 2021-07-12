import {GAME_SPEED} from "../../env";
import {Chara} from "../Model";

export default  (chara:Chara)=> {
    chara.scene.tweens.add({
      targets: chara.container,
      alpha: 0,
      duration: 1000 / GAME_SPEED,
    });
  }
