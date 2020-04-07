import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {addUnitToSquad} from '../DB';
import UnitListScene from '../Unit/UnitListScene';
import {Unit} from '../Unit/Model';
import BoardScene, {BOARD_SCENE_KEY} from '../Board/InteractiveBoardScene';

export class CreateSquadScene extends Phaser.Scene {
  unitListScene: UnitListScene | null = null;

  constructor() {
    super('CreateSquadScene');
  }

  preload = preload;

  create() {
    this.add.image(0, 0, 'backgrounds/squad_edit');

    this.renderUnitList();

    this.renderReturnBtn();
    console.log(`btn`);
  }


  renderUnitList() {
    this.unitListScene = new UnitListScene(100,40);
    this.unitListScene.onUnitClick = (chara:Chara)=>console.log(`hello from crete scene`,chara)
    this.scene.add('UnitListScene', this.unitListScene, true);
  }

  renderReturnBtn() {
    console.log('rendering return btn');

    const btn = this.add.text(1100, 100, 'Return to title');
    btn.setInteractive();
    btn.on('pointerdown', () => {

      this.destroyChildren();

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });

    });
    const list = this.add.text(1100, 200, 'Return to list');
    list.setInteractive();
    list.on('pointerdown', () => {

      this.destroyChildren();

      this.scene.transition({
        target: 'ListSquadsScene',
        duration: 0,
        moveBelow: true,
      });

    });

    console.log(`done`);
  }

  destroyChildren() {
    this.unitListScene?.destroy();
  }
}
