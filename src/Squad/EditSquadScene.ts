import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {addUnitToSquad} from '../DB';
import UnitListScene from '../Unit/UnitListScene';
import {Unit} from '../Unit/Model';
import BoardScene, {BOARD_SCENE_KEY} from '../Board/InteractiveBoardScene';

export class EditSquadScene extends Phaser.Scene {
  unitListScene: UnitListScene | null = null;
  boardScene: BoardScene | null = null;

  constructor() {
    super('EditSquadScene');
    console.log('editsqud constructor');
  }

  preload = preload;

  create({squad}: {squad: Squad}) {
    this.add.image(0, 0, 'backgrounds/squad_edit');

    this.renderBoard(squad);

    this.renderUnitList();

    this.renderReturnBtn();
    console.log(`btn`);
  }

  renderBoard(squad: Squad) {
    this.boardScene = new BoardScene(squad); 
    this.scene.add(BOARD_SCENE_KEY, this.boardScene, true);
  }

  renderUnitList() {
    this.unitListScene = new UnitListScene(
      (unit, x, y) => this.onDragFromList(unit, x, y),
      (unit, x, y, chara) => this.onDragEndFromList(unit, x, y, chara),
    );
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

      console.log(`xxx unit to replace`, unitToReplace);
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

    const btn = this.add.text(1100, 100, 'Return to title');
    btn.setInteractive();
    btn.on('pointerdown', () => {
      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });

      console.log(this.unitListScene);
      // this.scene.remove('unitList');
      // this.unitListScene?.rows.forEach((row) =>
      //   this.scene.remove(row.chara.key),
      // );
      // this.boardScene?.unitList.forEach((unit) => this.scene.remove(unit.key));

      // this.sys.displayList.removeAll()
    });

    console.log(`done`);
  }
}
