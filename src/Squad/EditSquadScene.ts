import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {Squad} from '../Squad/Model';
import {addUnitToSquad} from '../DB';
import UnitListScene from '../Unit/UnitListScene';
import {Unit} from '../Unit/Model';
import BoardScene, {BOARD_SCENE_KEY} from '../Board/InteractiveBoardScene';
import button from '../UI/button';
import menu from '../Backgrounds/menu';

export class EditSquadScene extends Phaser.Scene {
  unitListScene: UnitListScene | null = null;
  boardScene: BoardScene | null = null;

  constructor() {
    super('EditSquadScene');
    console.log('EditSquadScene constructor. this:', this);
  }

  create({squad}: {squad: Squad}) {

    menu(this)

    this.renderBoard(squad);

    this.renderUnitList();

    this.renderReturnBtn();
  }

  renderBoard(squad: Squad) {
    this.boardScene = new BoardScene(squad);
    this.scene.add(BOARD_SCENE_KEY, this.boardScene, true);
  }

  renderUnitList() {
    this.unitListScene = new UnitListScene(50, 40);
    this.unitListScene.onDrag = (unit, x, y) => this.onDragFromList(unit, x, y);
    this.unitListScene.onDragEnd = (unit, x, y, chara) =>
      this.onDragEndFromList(unit, x, y, chara);
    this.scene.add('UnitListScene', this.unitListScene, true);
  }

  onDragEndFromList(unit: Unit, x: number, y: number, chara: Chara) {
    const boardSprite = this.boardScene?.findTileByXY(x, y);

    console.log(`dropped on `, boardSprite);

    const {boardScene} = this;
    if (!boardScene) return;

    if (boardSprite) {
      const updatedSquad = addUnitToSquad(
        unit,
        boardScene.squad,
        boardSprite.boardX,
        boardSprite.boardY,
      );

      const unitToReplace = Object.values(boardScene.squad.members).find(
        (unit) =>
          unit.x === boardSprite.boardX && unit.y === boardSprite.boardY,
      );

      boardScene.squad = updatedSquad;

      //remove dragged unit chara
      this.unitListScene?.removeUnit(unit);
      //create new chara on board, representing same unit
      boardScene.placeUnit({
        member: updatedSquad.members[unit.id],
        fromOutside: true,
      });
      //remove replaced unit
      if (unitToReplace) {
        const charaToRemove = boardScene.unitList.find(
          (chara) => chara.unit.id === unitToReplace.id,
        );

        this.tweens.add({
          targets: charaToRemove?.container,
          y: (charaToRemove?.container?.y || 0) - 200,
          alpha: 0,
          ease: 'Cubic',
          duration: 400,
          repeat: 0,
          paused: false,
          yoyo: false,
        });
      }
    } else {
      console.log(`lets return`, unit, this.unitListScene?.rows);

      this.unitListScene?.returnToOriginalPosition(unit);
      this.unitListScene?.scaleDown(chara);
    }

    boardScene.tiles.forEach((tile) => tile.sprite.clearTint());
  }

  onDragFromList(_: Unit, x: number, y: number) {
    const {boardScene} = this;
    if (!boardScene) return;

    boardScene.tiles.forEach((tile) => tile.sprite.clearTint());
    const boardSprite = boardScene.findTileByXY(x, y);

    if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
  }

  renderReturnBtn() {
    console.log('rendering return btn');

    button(1100, 100, 'Return to title', this.add.container(0, 0), this, () => {
      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });

      this.destroyChildren();
    });

    button(1100, 200, 'Return to List', this.add.container(0, 0), this, () => {
      this.destroyChildren();
      this.scene.transition({
        target: 'ListSquadsScene',
        duration: 0,
        moveBelow: true,
      });
    });

    // const list = this.add.text(1100, 200, 'Return to list');
    // list.setInteractive();
    // list.on('pointerdown', () => {
    //   this.destroyChildren();

    //   this.scene.transition({
    //     target: 'ListSquadsScene',
    //     duration: 0,
    //     moveBelow: true,
    //   });
    // });

    console.log(`done`);
  }

  destroyChildren() {
    this.boardScene?.destroy();
    this.unitListScene?.destroy();
  }
}
