import {GAME_SPEED} from "../../env";
import {Chara} from "../Chara";

export default  (chara:Chara)=> {
    chara.tweens.add({
      targets: chara.container,
      alpha: 0,
      duration: 1000 / GAME_SPEED,
    });
  }
