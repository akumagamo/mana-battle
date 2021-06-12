import UnitListScene from '../Unit/UnitListScene';
import {Unit, UnitIndex} from '../Unit/Model';

export class CreateSquadScene extends Phaser.Scene {
  unitListScene: UnitListScene | null = null;

  constructor(public units: UnitIndex) {
    super('CreateSquadScene');
  }

  create() {
    this.add.image(0, 0, 'backgrounds/squad_edit');

    this.renderUnitList();

    this.renderReturnBtn();
  }

  renderUnitList() {
    this.unitListScene = new UnitListScene(100, 40, 8, this.units.toList());
    this.unitListScene.onUnitClick = (unit: Unit) => console.log(unit);
    this.scene.add('UnitListScene', this.unitListScene, true);
  }

  renderReturnBtn() {
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
