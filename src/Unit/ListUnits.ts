import * as Phaser from 'phaser';
import {preload} from '../preload';
import * as api from '../DB';
import {Text} from '../Models';
import {Chara} from '../Chara/Chara';
import {Unit} from './Model';
import {UnitDetailsBarScene} from './UnitDetailsBarScene';
import button from '../UI/button';

export class ListUnitsScene extends Phaser.Scene {
  units: Chara[] = [];
  page: number = 0;
  itemsPerPage: number = 40;
  unitDetails: Text[] = [];
  detailsBar: UnitDetailsBarScene | null = null;

  constructor() {
    super('ListUnitsScene');
  }

  preload = preload;

  create() {

    this.detailsBar = new UnitDetailsBarScene();
    this.renderUnitsList();

    this.scene.add('details-bar', this.detailsBar, true);

    button(1120, 20, 'Back to Title', this.add.container(0, 0), this, () => {
      this.removeChildren();

      this.scene.remove('UnitDetailsBarScene')

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });
  }

  renderUnitsList() {
    const units = Object.values(api.getUnits()).slice(
      this.page * this.itemsPerPage,
      this.page * this.itemsPerPage + this.itemsPerPage,
    );

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

    const chara = new Chara(
      key,
      this,
      unit,
      100 + x * 120,
      100 + y * 110,
      0.6,
      true,
    );

    chara.onClick((unit: Chara) => {
      this.renderUnitDetails(unit);
    });

    this.units.push(chara);
  }

  renderUnitDetails(chara: Chara) {
    this.detailsBar?.render(chara.unit.id);
  }

  renderNavigation() {}

  refresh() {
    this.removeChildren();
    this.renderUnitsList();
  }

  nextPage() {
    this.page = this.page + 1;
    this.refresh();
  }

  prevPage() {
    this.page = this.page - 1;
    this.refresh();
  }

  removeChildren() {
    this.units.forEach((chara) => {
      this.scene.remove(`list-chara-${chara.unit.id}`);
    });
    this.units = [];
    this.detailsBar?.destroy(this);
  }
}
