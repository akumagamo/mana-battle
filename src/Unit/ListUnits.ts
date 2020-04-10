import * as Phaser from 'phaser';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import * as api from '../DB';
import BoardScene from '../Board/StaticBoardScene';
import {Container, Pointer, Image, Text} from '../Models';
import {Chara} from '../Chara/Chara';
import {Unit} from './Model';

export class ListUnitsScene extends Phaser.Scene {
  units: Chara[] = [];
  page: number = 0;
  itemsPerPage: number = 20;

  constructor() {
    super('ListUnitsScene');
  }

  preload = preload;

  create() {
    this.renderUnitsList();
    this.renderControls();
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
    const key = `unit-list-chara-${unit.id}`;

    const chara = new Chara(
      key,
      this,
      unit,
      50 + x * 130,
      50 + y * 120,
      0.6,
      true,
      () => {},
      () => {},
    );

    this.scene.add(key, chara, true);

    this.units.push(chara);
  }

  renderControls() {}
  renderNavigation() {}

  refresh() {
    this.removeChildren();
    this.renderUnitsList();
    this.renderControls();
  }

  nextPage() {
    this.page = this.page + 1;
    this.refresh();
  }

  prevPage() {
    this.page = this.page - 1;
    this.refresh();
  }

  removeChildren() {}

  editSquad(squad: Squad) {
    this.removeChildren();

    this.scene.transition({
      target: 'EditSquadScene',
      duration: 0,
      moveBelow: true,
      data: {squad},
    });
  }
}
