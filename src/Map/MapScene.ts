import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {addUnitToSquad, getUnits, getUnit} from '../DB';
import UnitListScene from '../Unit/UnitListScene';
import {Unit} from '../Unit/Model';
import BoardScene, {BOARD_SCENE_KEY} from '../Board/InteractiveBoardScene';
import {INVALID_STATE} from '../errors';
import button from '../UI/button';
import {Container} from '../Models';

const cellSize = 100;

const boardPadding = 100;

export class MapScene extends Phaser.Scene {
  units: Chara[] = [];

  selectedUnit: string | null = null;

  constructor() {
    super('MapScene');
  }

  preload = preload;

  renderMap(container:Container) {
    console.log(`MapScene - renderMap`)

    const map = [
      [0, 0, 0, 1, 1, 1],
      [0, 1, 0, 1, 0, 1],
      [0, 1, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 1],
    ];

    map.forEach((arr, col) =>
      arr.forEach((n, row) => {
        const x = boardPadding + row * cellSize;
        const y = boardPadding + col * cellSize;
        const tile = this.add.image(x, y, 'panel');

        tile.setInteractive();
        tile.on('pointerdown', () => {
          if (this.selectedUnit) {
            this.moveUnit(this.selectedUnit, x, y);
          }
        });

        container.add(tile)

        if (n === 1) tile.setTint(0xdeaa87);

        tile.displayWidth = cellSize;
        tile.displayHeight = cellSize;
      }),
    );
  }
  renderUnits(container:Container) {
    console.log(`MapScene - renderUnits`)
    const unit = getUnit('0');

    if (!unit) return;

    const chara = new Chara('chara' + unit.id, this, unit, 300, 300, 0.5, true);

    if(chara.container)
      container.add(chara.container)

    this.units.push(chara);

    chara.onClick((c: Chara) => {
      console.log(`selected`, c);
      this.selectedUnit = chara.unit.id;
    });
  }

  renderUI(container:Container) {
    console.log(`MapScene - renderUI`)
    button(1100, 50, 'Return to Title', this.add.container(0, 0), this, () => {
      this.units.forEach((c) => this.scene.remove('chara' + c.unit.id));
      container.destroy()
      this.units = []
      //this.units.forEach((c) => c.container?.destroy());

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });
  }
  create() {
    console.log(`MapScene - create`)
    const container = this.add.container(0,0)
    this.renderMap(container);
    this.renderUnits(container);
    this.renderUI(container);
  }

  moveUnit(unitId: string, x: number, y: number) {
    console.log(`MapScene - moveUnit`)
    const chara = this.units.find((c) => c.unit.id === unitId);

    if (!chara) throw new Error(INVALID_STATE);

    this.tweens.add({
      targets: chara.container,
      x: x,
      y: y,
      duration: 500,
    });
  }
}
