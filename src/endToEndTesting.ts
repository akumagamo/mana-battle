import TitleScene from "./Scenes/TitleScene";
import CharaCreationScene from "./CharaCreation/CharaCreationScene";
import { MapScene } from "./Map/MapScene";
import { PLAYER_FORCE } from "./constants";
import { Unit } from "./Unit/Model";
import { ListSquadsScene } from "./Squad/ListSquadsScene";
import UnitListScene from "./Unit/UnitListScene";
import BoardScene from "./Board/InteractiveBoardScene";

const assertEquals = (condition: string, a: any, b: any) => {
  if (a !== b)
    throw new Error(
      `❌ Failed assertion: ${condition} - ${a.toString()} should equals ${b.toString()}`
    );
  else console.log("✅:", condition);
};
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
    scn.editSquadModalEvents.AddUnitButtonClicked.emit(null);
    //scn.editSquadModalEvents.OnDrag.emit({ x: 506, y: 197 });
    const unitListScene = scn.scene.manager.getScene(
      "UnitListScene"
    ) as UnitListScene;

    const boardScene = scn.scene.manager.getScene("BoardScene") as BoardScene;

    const chara = unitListScene.rows[0].chara;
    chara.handleDrag(500, 200);

    // TODO: improving this test: get all cell positions, hover over each one and
    // check if only the current one is tinted
    assertEquals(
      "A unit dragged from the list should paint the board cells when hovered over them",
      boardScene.tiles[3].sprite.tintTopLeft,
      8978227
    );
    assertEquals(
      "Other tiles should not be tinted",
      boardScene.tiles.every((t, i) => i == 3 || !t.sprite.isTinted),
      true
    );
    chara.handleDrag(490, 306);

    // TODO: improving this test: get all cell positions, hover over each one and
    // check if only the current one is tinted
    assertEquals(
      "Should paint another cell if dragged away",
      boardScene.tiles[7].sprite.tintTopLeft,
      8978227
    );
    assertEquals(
      "Other tiles should not be tinted",
      boardScene.tiles.every((t, i) => i == 7 || !t.sprite.isTinted),
      true
    );
  });
}
