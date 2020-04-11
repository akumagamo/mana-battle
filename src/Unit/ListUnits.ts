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

    const panel = this.add.image(50,500,'panel');

    panel.setOrigin(0,0)
    panel.displayWidth= 800
    panel.displayHeight = 170

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

    const write = (x: number, y: number, str: string | number) =>
      this.unitDetails.push(this.add.text(x, y, typeof str === 'number'? str.toString() : str));

    const baseX = 100
    const baseY = 550

    const colWidth = 100
    const rowHeight = 30

    const col = (x:number,y:number, strs:(string|number)[])=>
      strs.forEach((str,index)=>write(x, y + (rowHeight*index), str))

    const {unit:{ str, agi, int, wis, vit, dex}} = chara

    write(baseX, baseY, chara.unit.name);

    col(baseX+colWidth, baseY, ['STR', 'AGI', 'INT'])
    col(baseX+colWidth*2, baseY,  [str, agi, int])

    col(baseX+colWidth*3, baseY, ['WIS', 'VIT', 'DEX'])
    col(baseX+colWidth*4, baseY, [wis, vit, dex])


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
