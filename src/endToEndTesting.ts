import TitleScene from "./Scenes/TitleScene";
import CharaCreationScene from "./CharaCreation/CharaCreationScene";
import { MapScene } from "./Map/MapScene";
import { PLAYER_FORCE } from "./constants";

export function endToEndTesting(game: Phaser.Game) {
  game.events.on("TitleSceneCreated", (scn: TitleScene) => {
    scn.events.emit("NewGameButtonClicked");
  });
  game.events.on("CharaCreationSceneCreated", (scn: CharaCreationScene) => {
    scn.events.emit("ConfirmationButtonClicked");
  });
  game.events.on("MapSceneCreated", (scn: MapScene) => {
    const squad = scn.state.squads.find(
      (sqd) => sqd.squad.force === PLAYER_FORCE
    );
    scn.events.emit("CellClicked", { x: 3, y: 5 }, { x: 200, y: 400 });
    scn.events.emit("MovePlayerSquadButonClicked", scn, squad);
    scn.events.emit("CellClicked", { x: 4, y: 5 }, { x: 200, y: 400 });
  });
}
