import TitleScene from "./Scenes/TitleScene";
import CharaCreationScene from "./CharaCreation/CharaCreationScene";
import { MapScene } from "./Map/MapScene";
import { PLAYER_FORCE } from "./constants";
import { Unit } from "./Unit/Model";
import { ListSquadsScene } from "./Squad/ListSquadsScene";
import UnitListScene from "./Unit/UnitListScene";
import BoardScene from "./Board/InteractiveBoardScene";

const wait = (n: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), n));

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
      (document.getElementById("new-chara-name") as HTMLInputElement).value =
        "TestHero";
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
  game.events.once(
    "ListSquadsSceneCreated",
    async (listScene: ListSquadsScene) => {
      const squad = listScene.squads.toList().get(1);
      listScene.evs.SquadClicked.emit(squad);
      listScene.evs.SquadEditClicked.emit(squad);
      //scn.editSquadModalEvents.OnDrag.emit({ x: 506, y: 197 });
      const unitListScene = listScene.scene.manager.getScene(
        "UnitListScene"
      ) as UnitListScene;

      const boardScene = listScene.scene.manager.getScene(
        "BoardScene"
      ) as BoardScene;

      const chara = unitListScene.unitRows[0].chara;

      boardScene.tiles.forEach((t, index) => {
        chara.handleDrag(t.sprite.x, t.sprite.y - 100);
        assert(
          `A unit dragged from the list should paint the board cells when hovered over them (${t.sprite.x}, ${t.sprite.y})`,
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
      const getEmptyCell = (board: BoardScene) =>
        board.tiles.find(
          (t) =>
            !boardScene.squad.members.some(
              (m) => m.x === t.boardX && m.y === t.boardY
            )
        );

      // Drag to empty cell
      const emptyCell = getEmptyCell(boardScene);

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

      const replacedCharaEid = chara.props.unit.id;

      const newChara = unitListScene.unitRows[0].chara;

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

      unitListScene.nextPage();
      assert("Should list remaining units", unitListScene.unitRows.length, 3);

      unitListScene.prevPage();
      assert("Should list full page", unitListScene.unitRows.length, 5);

      listScene.editSquadModalEvents.OnClose.emit(null);

      CreateSquadModal(listScene, game);

      console.log("TEST FINISHED");
    }
  );
}

function CreateSquadModal(listScene: ListSquadsScene, game: Phaser.Game) {
  listScene.evs.CreateSquadClicked.emit(null);

  const newUnitListScene = game.scene.getScene(
    "UnitListScene"
  ) as UnitListScene;

  newUnitListScene.nextPage();

  const newBoardScene = game.scene.getScene("BoardScene") as BoardScene;

  [0, 0, 0].forEach((_, index) => {
    const chara_ = newUnitListScene.unitRows[0].chara;

    chara_.handleDrag(
      newBoardScene.tiles[index].sprite.x,
      newBoardScene.tiles[index].sprite.y - 100
    );
    chara_.handleDragEnd(newBoardScene.tiles[index].sprite.y - 100);
  });

  assert(
    "Should move to previous page if current page became empty",
    newUnitListScene.unitRows.length,
    5
  );

  listScene.editSquadModalEvents.OnClose.emit(null)
}
