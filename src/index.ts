import "phaser";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "./constants";
import TitleScene from "./Scenes/TitleScene";
import defaultData from "./defaultData";

(() => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#000000",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: TitleScene
      //EditSquadScene,
      //ListSquadsScene,
      //ListUnitsScene,
      //MapScene,
      //MapListScene,
      //CombatScene,
      //OptionsScene,
      //WorldScene,
      //TheaterScene,
      //CharaCreationScene,
    ,
    dom: {
      createContainer: true,
    },
    parent: "content",
  };

  if (localStorage.getItem("player") === null) {
    defaultData(true);
  }

  const game = new Phaser.Game(config);
  game.scale.lockOrientation(Phaser.Scale.PORTRAIT);
})();
