import * as Phaser from 'phaser';
import * as api from '../DB';
import {Text, Image} from '../Models';
import {Chara} from '../Chara/Chara';
import {Unit} from './Model';
import {UnitDetailsBarScene} from './UnitDetailsBarScene';
import button from '../UI/button';
import menu from '../Backgrounds/menu';

type ListUnit = {
  tile: Image;
  chara: Chara;
};
export class ListUnitsScene extends Phaser.Scene {
  units: ListUnit[] = [];
  page: number = 0;
  itemsPerPage: number = 30;
  unitDetails: Text[] = [];
  detailsBar: UnitDetailsBarScene | null = null;

  constructor() {
    super('ListUnitsScene');
  }

  getUnits() {
    // TODO: filter only player units
    return Object.values(api.getUnits()).slice(
      this.page * this.itemsPerPage,
      this.page * this.itemsPerPage + this.itemsPerPage,
    );
  }
  create() {
    menu(this);

    // TODO: filter only player units
    const units = this.getUnits();

    this.detailsBar = new UnitDetailsBarScene();
    this.renderUnitsList(units);

    this.scene.add('details-bar', this.detailsBar, true);

    button(1120, 20, 'Back to Title', this.add.container(0, 0), this, () => {
      this.removeChildren();

      this.scene.remove('UnitDetailsBarScene');

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });

    this.selectUnit(units[0].id);
  }

  renderUnitsList(units: Unit[]) {
    const rows = this.formatList(units, []);

    rows.forEach((row, y) =>
      row.forEach((col, x) => this.renderUnit(col, x, y)),
    );
  }

  formatList(units: Unit[], accumulator: Unit[][]): Unit[][] {
    const cols = 10;
    if (units.length <= cols) {
      return accumulator.concat([units]);
    } else {
      const slice = units.slice(0, cols);
      return this.formatList(
        units.slice(cols, units.length),
        accumulator.concat([slice]),
      );
    }
  }

  renderUnit(unit: Unit, x: number, y: number) {
    const key = `list-chara-${unit.id}`;

    const x_ = 100 + x * 120;
    const y_ = 100 + y * 130;

    const tile = this.add.image(x_ + 2, y_ + 63, 'tile');
    tile.setScale(0.4);
    const chara = new Chara(key, this, unit, x_, y_, 0.6, true, false);

    chara.onClick(() => this.selectUnit(unit.id));

    tile.setInteractive();
    tile.on('pointerdown', () => this.selectUnit(unit.id));

    this.units.push({tile, chara});
  }

  selectUnit(id: string) {
    this.units.forEach((u) => u.tile.clearTint());
    const listUnit = this.units.find((u) => u.chara.unit.id === id);

    if (listUnit) {
      listUnit.tile.setTint(0x333333);

      this.renderUnitDetails(listUnit.chara);
    }
  }

  renderUnitDetails(chara: Chara) {
    if (!this.detailsBar) return;

    this.detailsBar.render(chara.unit);
    this.detailsBar.onHatToggle = (unit: Unit) => {
      this.removeUnitList();
      this.renderUnitsList(this.getUnits());

      this.selectUnit(unit.id);
    };
  }

  refresh() {
    this.removeChildren();
    this.renderUnitsList(this.getUnits());
  }
  removeUnitList() {
    this.units.forEach((chara) => {
      this.scene.remove(`list-chara-${chara.chara.unit.id}`);
      chara.tile.destroy();
    });
    this.units = [];
  }

  removeChildren() {
    this.removeUnitList();
    this.detailsBar?.destroy(this);
  }
}
