import * as Phaser from 'phaser';
import UnitListScene from '../Unit/UnitListScene';
import {Unit} from '../Unit/Model';

export class CreateSquadScene extends Phaser.Scene {
  unitListScene: UnitListScene | null = null;

  constructor() {
    super('CreateSquadScene');
  }

  create() {
    this.add.image(0, 0, 'backgrounds/squad_edit');

    this.renderUnitList();

    this.renderReturnBtn();
    console.log(`btn`);
  }

  renderUnitList() {
    this.unitListScene = new UnitListScene(100, 40);
    this.unitListScene.onUnitClick = (unit: Unit) =>
      console.log(`hello from crete scene`, unit);
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
