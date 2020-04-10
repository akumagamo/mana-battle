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
  unitDetails: Text[] = [];

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
      100 + y * 150,
      0.6,
      true,
      () => {},
      () => {},
    );

    this.scene.add(key, chara, true);

    chara.onClick = (unit: Chara) => {
      this.renderUnitDetails(unit);
    };

    this.units.push(chara);
  }

  renderUnitDetails(chara: Chara) {
    this.unitDetails.forEach((item) => item.destroy());
    this.unitDetails = [];

    const write = (x: number, y: number, str: string) =>
      this.unitDetails.push(this.add.text(x, y, str));

    write(100, 600, chara.unit.name);
    write(200, 600, 'STR');
    write(200, 630, 'AGI');
    write(200, 660, 'INT');
    write(250, 600, chara.unit.str.toString());
    write(250, 630, chara.unit.agi.toString());
    write(250, 660, chara.unit.int.toString());
    write(300, 600, 'WIS');
    write(300, 630, 'VIT');
    write(300, 660, 'DEX');
    write(350, 600, chara.unit.wis.toString());
    write(350, 630, chara.unit.vit.toString());
    write(350, 660, chara.unit.dex.toString());
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
