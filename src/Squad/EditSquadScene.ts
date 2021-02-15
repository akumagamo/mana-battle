import * as Phaser from "phaser";
import { Chara } from "../Chara/Chara";
import * as Squad from "../Squad/Model";
import { saveSquadIntoDB, saveUnitIntoDB } from "../DB";
import UnitListScene from "../Unit/UnitListScene";
import { Unit, UnitIndex } from "../Unit/Model";
import BoardScene, { BOARD_SCENE_KEY } from "../Board/InteractiveBoardScene";
import button from "../UI/button";
import menu from "../Backgrounds/menu";
import SmallUnitDetailsBar from "../Unit/SmallUnitDetailsBar";
import { Container } from "../Models";
import { Map } from "immutable";

export class EditSquadScene extends Phaser.Scene {
  unitListScene: UnitListScene | null = null;
  boardScene: BoardScene | null = null;
  unitDetails: Container | null = null;
  unitIndex: UnitIndex = Map();

  constructor() {
    super("EditSquadScene");
  }

  create({ squad, unitIndex }: { squad: Squad.SquadRecord; unitIndex: UnitIndex }) {
    menu(this);

    this.renderBoard(squad, unitIndex);

    this.renderUnitList();

    this.renderReturnBtn();
  }

  renderBoard(squad: Squad.SquadRecord, unitIndex: UnitIndex) {
    this.boardScene = new BoardScene(squad, saveSquadIntoDB, unitIndex);
    this.scene.add(BOARD_SCENE_KEY, this.boardScene, true);

    this.boardScene.makeUnitsClickable((c) => {
      this.unitDetails?.destroy();
      this.unitDetails = SmallUnitDetailsBar(0, 650, this, c.unit);
    });
  }

  renderUnitList() {
    this.unitListScene = new UnitListScene(50, 40, 6);
    this.unitListScene.onDrag = (unit, x, y) => this.onDragFromList(unit, x, y);
    this.unitListScene.onDragEnd = (unit, x, y, chara) =>
      this.onDragEndFromList(unit, x, y, chara);
    this.scene.add("UnitListScene", this.unitListScene, true);
  }

  onDragEndFromList(unit: Unit, x: number, y: number, chara: Chara) {
    const boardSprite = this.boardScene?.findTileByXY(x, y);

    const { boardScene } = this;
    if (!boardScene) return;

    if (boardSprite) {
      const { updatedSquad, added, removed } = Squad.addMember(
        unit,
        boardScene.squad,
        boardSprite.boardX,
        boardSprite.boardY
      );

      added.forEach(() =>
        saveUnitIntoDB({ ...unit, squad: boardScene.squad.id })
      );

      removed.forEach((u) =>
        saveUnitIntoDB({ ...this.unitIndex.get(u.id), squad: null })
      );

      saveSquadIntoDB(updatedSquad);

      const unitToReplace = Squad.getMemberByPosition({
        x: boardSprite.boardX,
        y: boardSprite.boardY,
      })(boardScene.squad);

      boardScene.squad = updatedSquad;

      //remove dragged unit chara
      this.unitListScene?.removeUnit(unit);
      //create new chara on board, representing same unit
      boardScene.placeUnit({
        member: updatedSquad.members.get(unit.id),
        fromOutside: true,
      });
      //remove replaced unit
      if (unitToReplace) {
        const charaToRemove = boardScene.unitList.find(
          (chara) => chara.unit.id === unitToReplace.id
        );

        this.tweens.add({
          targets: charaToRemove?.container,
          y: (charaToRemove?.container?.y || 0) - 200,
          alpha: 0,
          ease: "Cubic",
          duration: 400,
          repeat: 0,
          paused: false,
          yoyo: false,
        });
      }
      boardScene.highlightTile(boardSprite);
    } else {
      this.unitListScene?.returnToOriginalPosition(unit);
      this.unitListScene?.scaleDown(chara);

      boardScene.tiles.forEach((tile) => tile.sprite.clearTint());
    }
  }

  onDragFromList(_: Unit, x: number, y: number) {
    const { boardScene } = this;
    if (!boardScene) return;

    boardScene.tiles.forEach((tile) => tile.sprite.clearTint());
    const boardSprite = boardScene.findTileByXY(x, y);

    if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
  }

  renderReturnBtn() {
    button(1100, 100, "Return to title", this.add.container(0, 0), this, () => {
      this.scene.transition({
        target: "TitleScene",
        duration: 0,
        moveBelow: true,
      });

      this.destroyChildren();
    });

    button(1100, 200, "Return to List", this.add.container(0, 0), this, () => {
      this.destroyChildren();
      this.scene.transition({
        target: "ListSquadsScene",
        duration: 0,
        moveBelow: true,
      });
    });
  }

  destroyChildren() {
    this.boardScene?.destroy();
    this.unitListScene?.destroy();
  }
}
