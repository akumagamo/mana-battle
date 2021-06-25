import { Text, Image } from '../Models';
import { Chara } from '../Chara/Model';
import { Unit, UnitIndex } from './Model';
import { UnitDetailsBarScene } from './UnitDetailsBarScene';
import button from '../UI/button';
import menu from '../Backgrounds/menu';
import { List } from 'immutable';
import onClick from '../Chara/events/onClick';
import createChara from '../Chara/createChara';

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
    // return api
    //   .getUnitsFromDB()
    //   .slice(
    //     this.page * this.itemsPerPage,
    //     this.page * this.itemsPerPage + this.itemsPerPage
    //   );
    return {} as UnitIndex;
  }
  create() {
    menu(this);

    // TODO: filter only player units
    const units = this.getUnits();

    this.detailsBar = new UnitDetailsBarScene(true);
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

    const first = units.first<Unit>();

    this.selectUnit(first.id);
  }

  renderUnitsList(units: UnitIndex) {
    const rows = this.formatList(units, List());

    rows.forEach((row, y) =>
      row.forEach((col, x) => this.renderUnit(col, x, y))
    );
  }

  formatList(
    units: UnitIndex,
    accumulator: List<List<Unit>>
  ): List<List<Unit>> {
    const cols = 10;
    if (units.size <= cols) {
      return accumulator.push(units.toList());
    } else {
      const slice = units.slice(0, cols);
      return this.formatList(
        units.slice(cols, units.size),
        accumulator.push(slice.toList())
      );
    }
  }

  renderUnit(unit: Unit, x: number, y: number) {
    const key = `list-chara-${unit.id}`;

    const x_ = 100 + x * 120;
    const y_ = 100 + y * 130;

    const tile = this.add.image(x_ + 2, y_ + 63, 'tile');
    tile.setScale(0.4);
    const chara = createChara({
      scene: this,
      unit,
      x: x_,
      y: y_,
      scale: 0.6,
    });

    onClick(chara, () => this.selectUnit(unit.id));

    tile.setInteractive();
    tile.on('pointerdown', () => this.selectUnit(unit.id));

    this.units.push({ tile, chara });
  }

  selectUnit(id: string) {
    this.units.forEach((u) => u.tile.clearTint());
    const listUnit = this.units.find((u) => u.chara.props.unit.id === id);

    if (listUnit) {
      listUnit.tile.setTint(0x333333);

      this.renderUnitDetails(listUnit.chara);
    }
  }

  renderUnitDetails(chara: Chara) {
    if (!this.detailsBar) return;

    this.detailsBar.render(chara.props.unit);
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
    this.units.forEach((listUnit) => {
      this.scene.remove(`list-chara-${listUnit.chara.props.unit.id}`);
      listUnit.tile.destroy();
    });
    this.units = [];
  }

  removeChildren() {
    this.removeUnitList();
    this.detailsBar?.destroy(this);
  }
}
