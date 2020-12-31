import "phaser";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "./constants";
import TitleScene from "./Scenes/TitleScene";
import { EditSquadScene } from "./Squad/EditSquadScene";
import { ListSquadsScene } from "./Squad/ListSquadsScene";
import { ListUnitsScene } from "./Unit/ListUnits";
import { MapScene } from "./Map/MapScene";
import MapListScene from "./Map/MapListScene";
import CombatScene from "./Combat/CombatScene";
import OptionsScene from "./Scenes/OptionsScene";
import WorldScene from "./Scenes/World";
import defaultData from "./defaultData";

console.log(`Starting up app. Some lessons to remember 📚:
  - avoid promises in rendering (this creates conflicts with Phaser's event manager)
  - avoid reappling/removing events from all map cells, as this is slow
  - doing fire nested events ("but I want to make it shorter!" re: you are just hiding complexity under the rug, and it will bite you later)
`);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#000000",
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    TitleScene,
    EditSquadScene,
    ListSquadsScene,
    ListUnitsScene,
    MapScene,
    MapListScene,
    CombatScene,
    OptionsScene,
    WorldScene,
  ],
};

if (localStorage.getItem("player") === null) {
  defaultData(true);
}

const game = new Phaser.Game(config);
game.scale.lockOrientation(Phaser.Scale.PORTRAIT);
