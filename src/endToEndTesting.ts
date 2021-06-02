import TitleScene from "./Scenes/TitleScene";
import CharaCreationScene from "./CharaCreation/CharaCreationScene";
import { MapScene } from "./Map/MapScene";
import { PLAYER_FORCE } from "./constants";
import { Unit } from "./Unit/Model";
import { ListSquadsScene } from "./Squad/ListSquadsScene";
import UnitListScene from "./Unit/UnitListScene";
import BoardScene from "./Board/InteractiveBoardScene";

const assert = (condition: string, a: any, b: any) => {
  if (a !== b)
    throw new Error(
      `❌ ${condition} - ${a.toString()} should equals ${b.toString()}`
    );
  else console.log("✅", condition);
};

export function endToEndTesting(game: Phaser.Game) {
  game.events.once("TitleSceneCreated", (scn: TitleScene) => {
    scn.sceneEvents.NewGameButtonClicked();
  });
  game.events.once(
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
  game.events.once("ListSquadsSceneCreated", (listScene: ListSquadsScene) => {
    const squad = listScene.squads.toList().get(1);
    listScene.evs.SquadClicked.emit(squad);
    listScene.evs.SquadEditClicked.emit(squad);
    listScene.editSquadModalEvents.AddUnitButtonClicked.emit(null);
    //scn.editSquadModalEvents.OnDrag.emit({ x: 506, y: 197 });
    const unitListScene = listScene.scene.manager.getScene(
      "UnitListScene"
    ) as UnitListScene;

    const boardScene = listScene.scene.manager.getScene(
      "BoardScene"
    ) as BoardScene;

    const chara = unitListScene.rows[0].chara;

    boardScene.tiles.forEach((t, index) => {
      chara.handleDrag(t.sprite.x, t.sprite.y - 100);
      assert(
        "A unit dragged from the list should paint the board cells when hovered over them",
        boardScene.tiles[index].sprite.tintTopLeft,
        8978227
      );
      assert(
        "Other tiles should not be tinted",
        boardScene.tiles.every((t, i) => i == index || !t.sprite.isTinted),
        true
      );
    });

    assert(
      "Before adding a character, the squad should have 5 members",
      boardScene.squad.members.size,
      5
    );
    assert(
      "The character is not is not in the squad",
      boardScene.squad.members.has(chara.props.unit.id),
      false
    );

    // Drag to empty cell
    let emptyCell = boardScene.tiles.find((t) =>
      !boardScene.squad.members.some((m) => m.x === t.boardX && m.y === t.boardY)
    );

    chara.handleDrag(emptyCell.sprite.x, emptyCell.sprite.y - 100);
    chara.handleDragEnd(emptyCell.sprite.y - 100);

    assert(
      "After adding a character, the squad should have 6 members",
      boardScene.squad.members.size,
      6
    );
    assert(
      "The dragged character was added to the squad",
      boardScene.squad.members.has(chara.props.unit.id),
      true
    );

    const replacedCharaEid = chara.props.unit.id 

    const newChara = unitListScene.rows[0].chara;

    newChara.handleDrag(emptyCell.sprite.x, emptyCell.sprite.y - 100);
    newChara.handleDragEnd(emptyCell.sprite.y - 100);

    assert(
      "When replacing a character, the number of units is still the same",
      boardScene.squad.members.size,
      6
    );
    assert(
      "The dragged character was added to the squad",
      boardScene.squad.members.has(newChara.props.unit.id),
      true
    );

    assert(
      "The repaced character is no longer in the squad",
      !boardScene.squad.members.has(replacedCharaEid),
      true
    );

    console.log("TEST FINISHED");
  });
}
