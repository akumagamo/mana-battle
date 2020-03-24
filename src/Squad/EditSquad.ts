import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {addUnitToSquad} from '../DB';
import UnitListScene from '../Unit/UnitListScene';
import {Unit} from '../Unit/Model';
import BoardScene, {BOARD_SCENE_KEY} from '../Board/BoardScene';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from '../constants';

const centerX = SCREEN_WIDTH / 2;
const centerY = SCREEN_HEIGHT / 2 - 100;
const tileWidth = 128;
const tileHeight = 64;

export class EditSquadScene extends Phaser.Scene {
  unitListScene: UnitListScene | null = null;
  boardScene: BoardScene | null = null;

  constructor() {
    super('EditSquadScene');
    console.log('editsqud constructor');
  }

  preload = preload;

  create({squad}: {squad:Squad}) {
    this.renderBoard(squad);

    this.renderUnitList();

    this.renderReturnBtn();
    console.log(`btn`);
  }

  renderBoard(squad:Squad) {
    this.boardScene = new BoardScene(
      centerX,
      centerY,
      squad,
      tileWidth,
      tileHeight,
    );

    this.scene.add(BOARD_SCENE_KEY, this.boardScene, true);
  }

  renderUnitList() {
    this.unitListScene = new UnitListScene(
      this.onDragFromList,
      this.onDragEndFromList,
    );
    this.scene.add('UnitListScene', this.unitListScene, true);
  }

  onDragEndFromList(unit: Unit, x: number, y: number, chara: Chara) {
    const boardSprite = this.boardScene?.findTileByXY({
      x: x,
      y: y,
    });

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

      boardScene.squad = updatedSquad;

      this.unitListScene?.removeUnit(unit);
      boardScene.addUnitToBoard(updatedSquad.members[unit.id]);
    } else {
      console.log(`lets return`, unit, this.unitListScene?.rows);

      this.unitListScene?.returnToOriginalPosition(unit);
      this.unitListScene?.scaleDown(chara);
    }
  }

  onDragFromList(_: Unit, x: number, y: number) {
    const {boardScene} = this;
    if (!boardScene) return;
    boardScene.tiles.forEach((tile) => tile.sprite.clearTint());
    const boardSprite = boardScene.findTileByXY({
      x: x,
      y: y,
    });

    if (boardSprite) boardSprite.sprite.setTint(0x33ff88);
  }

  renderReturnBtn() {
    console.log('rendering return btn');

    const btn = this.add.text(1100, 100, 'Return to title');
    btn.setInteractive();
    btn.on('pointerdown', () => {
      this.scene.stop('UnitListScene')
      this.scene.stop('BoardScene')
      console.log(this.unitListScene)
     // this.scene.remove('unitList');
     // this.unitListScene?.rows.forEach((row) =>
     //   this.scene.remove(row.chara.key),
     // );
     // this.boardScene?.unitList.forEach((unit) => this.scene.remove(unit.key));
    this.scene.start('TitleScene');

     // this.sys.displayList.removeAll()
      
    });

    console.log(`done`);
  }
}
