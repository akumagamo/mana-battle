import TitleScene from "./Scenes/TitleScene";
import CharaCreationScene from "./CharaCreation/CharaCreationScene";
import { MapScene } from "./Map/MapScene";
import { PLAYER_FORCE } from "./constants";
import { Chara } from "./Chara/Chara";
import { Unit } from "./Unit/Model";
import { ListSquadsScene } from "./Squad/ListSquadsScene";
import {handleAddUnitButtonClicked} from "./Squad/EditSquadModal";

export function endToEndTesting(game: Phaser.Game) {
  game.events.on("TitleSceneCreated", (scn: TitleScene) => {
    scn.sceneEvents.NewGameButtonClicked();
  });
  game.events.on(
    "CharaCreationSceneCreated",
    (
      scn: CharaCreationScene,
      onHeroCreated: (value: Unit | PromiseLike<Unit>) => void
    ) => {
      scn.sceneEvents.ConfirmationButtonClicked(onHeroCreated);
    }
  );
  game.events.once("MapSceneCreated", (scn: MapScene) => {
    scn.evs.OrganizeButtonClicked.emit(scn);

    return;
    const squad = scn.state.squads.find(
      (sqd) => sqd.squad.force === PLAYER_FORCE
    );
    scn.evs.CellClicked.emit({
      tile: { x: 3, y: 5 },
      pointer: { x: 200, y: 400 },
    });
    scn.evs.MovePlayerSquadButonClicked.emit({
      mapScene: scn,
      mapSquad: squad,
    });
    scn.evs.CellClicked.emit({
      tile: { x: 4, y: 5 },
      pointer: { x: 200, y: 400 },
    });
    scn.evs.SquadArrivedInfoMessageCompleted.on((portraitKey: string) => {
      scn.evs.CloseSquadArrivedInfoMessage.emit(portraitKey);

      scn.evs.MovePlayerSquadButonClicked.emit({
        mapScene: scn,
        mapSquad: squad,
      });
      scn.evs.CellClicked.emit({
        tile: { x: 6, y: 4 },
        pointer: { x: 200, y: 400 },
      });
    });
  });
  game.events.on("ListSquadsSceneCreated", (scn: ListSquadsScene) => {
    const squad = scn.squads.toList().get(1);
    scn.evs.SquadClicked.emit(squad);
    scn.evs.SquadEditClicked.emit(squad);
    scn.editSquadModalEvents.AddUnitButtonClicked.emit(null)
  });
}
