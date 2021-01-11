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
import TheaterScene from "./Theater/TheaterScene";
import CharaCreationScene from "./CharaCreation/CharaCreationScene";

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
    TheaterScene,
    CharaCreationScene,
  ],
};

if (localStorage.getItem("player") === null) {
  defaultData(true);
}

const game = new Phaser.Game(config);
game.scale.lockOrientation(Phaser.Scale.PORTRAIT);

if (process.env.NODE_ENV !== "production") {
  //@ts-ignore
  window.game = game;

  //mapTest();
}

function wait(n: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, n);
  });
}

async function mapTest() {
  await wait(3000);

  //@ts-ignore
  window.title.mapsEvent();

  await wait(1500);

  //@ts-ignore
  window.mapListScene.onMapSelected(0);

  await wait(2000);
  //@ts-ignore
  window.moveButton();

  await wait(1000);

  //@ts-ignore
  window.clickCell(5, 6);

  await wait(1000);

  //@ts-ignore
  window.clickWait();

  await wait(6000);

  //@ts-ignore
  window.moveButton();

  await wait(1000);

  //@ts-ignore
  window.clickCell(6, 5);

  await wait(1000);

  //@ts-ignore
  window.clickAttack();

  await wait(1000);

  //@ts-ignore
  window.clickCell(6, 4);
}
