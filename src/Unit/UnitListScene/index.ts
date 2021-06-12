import Phaser from 'phaser';
import { Unit } from '../Model';
import { Chara } from '../../Chara/Model';
import { error, INVALID_STATE } from '../../errors';
import { Text, Container } from '../../Models';
import button from '../../UI/button';
import { List } from 'immutable';
import onEnableDrag from '../../Chara/events/onEnableDrag';
import createChara from '../../Chara/createChara';

// TODO: fix list display when unit in board is replaced with unit from list

const rowWidth = 200;
const rowHeight = 90;
const rowOffsetY = -30;
const rowOffsetX = -50;

export default class UnitListScene extends Phaser.Scene {
  public unitRows: { chara: Chara; text: Text; container: Container }[];
  private page: number;
  private pagingControls: (() => void)[] = [];
  public onUnitClick: ((unit: Unit) => void) | null = null;
  public onDrag: (unit: Unit, x: number, y: number) => void;
  public onDragEnd: (chara: Chara, x: number, y: number) => void;

  constructor(
    public x: number,
    public y: number,
    public itemsPerPage: number,
    public units: List<Unit>
  ) {
    super('UnitListScene');
    this.unitRows = [];
    this.page = 0;
  }

  create() {
    this.events.on('shutdown', () => this.destroy());
    this.render();
    this.renderControls();

    this.game.events.emit('UnitListSceneCreated', this);
  }

  makeBackground() {
    var rect = new Phaser.Geom.Rectangle(
      rowOffsetX,
      rowOffsetY,
      rowWidth,
      rowHeight
    );
    var graphics = this.add.graphics({
      fillStyle: { color: 0x0000ff },
    });

    graphics.alpha = 0.2;

    graphics.fillRectShape(rect);
    return graphics;
  }

  destroy() {
    this.unitRows.forEach((row) => {
      row.chara.destroy();
    });
    this.unitRows = [];
    this.units = List();
  }

  renderControls() {
    this.pagingControls.forEach((destroy) => destroy());

    const baseY = 480;

    const totalUnits = this.units.size;

    if (this.page !== 0) {
      const prev = button(
        this.x - 20,
        this.y + baseY,
        ' <= ',
        this.add.container(),
        this,
        () => this.prevPage(),
        false,
        50
      );
      this.pagingControls.push(prev.destroy);
    }

    const isLastPage =
      totalUnits < this.itemsPerPage ||
      this.itemsPerPage * (this.page + 1) >= totalUnits;

    if (!isLastPage) {
      const next = button(
        this.x + 50,
        this.y + baseY,
        ' => ',
        this.add.container(),
        this,
        () => this.nextPage(),
        false,
        50
      );

      this.pagingControls.push(next.destroy);
    }
  }

  nextPage() {
    this.page = this.page + 1;
    this.clearUnitList();
    this.render();
    this.renderControls();
  }

  prevPage() {
    this.page = this.page - 1;
    this.clearUnitList();
    this.render();

    this.renderControls();
  }

  clearUnitList() {
    this.unitRows.forEach((row) => {
      row.chara.destroy();
      this.children.remove(row.container);
    });

    this.unitRows = [];
  }

  getUnitsToRender() {
    return this.units.slice(
      this.page * this.itemsPerPage,
      this.page * this.itemsPerPage + this.itemsPerPage
    );
  }

  render() {
    const unitsToRender = this.getUnitsToRender();
    unitsToRender.forEach(this.renderUnitListItem.bind(this));
  }

  private handleUnitDrag(unit: Unit, x: number, y: number, chara: Chara) {
    this.scaleUp(chara);
    // TODO: this might not be working
    chara.charaWrapper.z = Infinity;
    return this.onDrag(unit, x, y);
  }

  private handleUnitDragEnd = (chara: Chara) => (x: number, y: number) => {
    this.renderControls();
    if (this.onDragEnd) this.onDragEnd(chara, x, y);
  };

  private renderUnitListItem(unit: Unit, index: number) {
    const { x, y } = this.getRowPosition(index);
    const key = this.makeUnitKey(unit);

    const container = this.add.container(x, y);

    var rect = new Phaser.Geom.Rectangle(
      rowOffsetX,
      rowOffsetY,
      rowWidth,
      rowHeight
    );
    const background = this.makeBackground();
    background.setInteractive(rect, Phaser.Geom.Rectangle.Contains);

    container.add(background);

    const chara = createChara({
      parent: this,
      unit,
      x,
      y,
      scale: 0.5,
    });

    onEnableDrag(
      chara,
      (unit, x, y, chara) => this.handleUnitDrag(unit, x, y, chara),
      (chara) => (x, y) => this.handleUnitDragEnd(chara)(x, y)
    );

    const text = this.add.text(40, 30, unit.name);

    container.add(text);
    //TODO: move background creation to
    this.unitRows.push({ chara, text, container });

    return chara;
  }

  private getRowPosition(index: number) {
    const lineHeight = 100;
    return {
      x: this.x,
      y: this.y + lineHeight * index,
    };
  }

  private getUnitIndex(unit: Unit) {
    return this.unitRows.findIndex(
      (row) => row.chara.props.unit.id === unit.id
    );
  }

  returnToOriginalPosition(chara: Chara) {
    const index = this.getUnitIndex(chara.props.unit);

    const row = this.unitRows.find((row) => row.chara.id === chara.id);

    if (!row) {
      return error(INVALID_STATE);
    }

    this.reposition(row, index);
  }

  scaleUp(chara: Chara) {
    this.tweens.add({
      targets: chara.container,
      scale: 1,
      duration: 400,
      ease: 'Cubic',
      repeat: 0,
      paused: false,
      yoyo: false,
    });
  }
  scaleDown(chara: Chara) {
    this.tweens.add({
      targets: chara.container,
      scale: 0.5,
      duration: 400,
      ease: 'Cubic',
      repeat: 0,
      paused: false,
      yoyo: false,
    });
  }

  makeUnitKey(unit: Unit) {
    return 'unit-list-' + unit.id;
  }

  reposition(
    { chara, container }: { chara: Chara; container: Container },
    index: number
  ) {
    const { x, y } = this.getRowPosition(index);

    this.tweens.add({
      targets: chara.container,
      x,
      y,
      duration: 600,
      ease: 'Cubic',
      repeat: 0,
      paused: false,
      yoyo: false,
    });

    this.tweens.add({
      targets: container,
      x,
      y,
      duration: 600,
      ease: 'Cubic',
      repeat: 0,
      paused: false,
      yoyo: false,
    });
  }

  addUnit(unit: Unit) {
    this.units = this.units.push(unit);

    if (this.units.size < this.itemsPerPage) {
      const newChara = this.renderUnitListItem(unit, this.units.size - 1);

      newChara.container.setPosition(
        newChara.container.x,
        newChara.container.y
      );
    }
  }
  removeUnitFromList(unit: Unit) {
    this.units = this.units.filter((u) => u.id !== unit.id);

    const findUnit = (row: { chara: Chara }): boolean =>
      row.chara.props.unit.id === unit.id;
    this.unitRows.filter(findUnit).forEach((row) => {
      this.removeUnitRow(row);
    });

    this.unitRows = this.unitRows.filter((row) => !findUnit(row));
    this.unitRows.forEach((row, index) => this.reposition(row, index));

    const unitsToRender = this.getUnitsToRender();

    if (unitsToRender.size < 1 && this.units.size > 1) {
      this.prevPage();
      return;
    }

    if (unitsToRender.size < 1) return;

    unitsToRender.toJS().map((u, index) => {
      const row = this.unitRows.find((row) => row.chara.props.unit.id === u.id);

      if (row) {
        this.reposition(row, index);
      } else {
        const newChara = this.renderUnitListItem(u, index);

        newChara.container.setPosition(
          newChara.container.x,
          newChara.container.y
        );
      }
    });

    this.renderControls();
  }

  private removeUnitRow(row: {
    chara: Chara;
    text: Text;
    container: Container;
  }) {
    row.chara.charaWrapper.destroy();
    this.children.remove(row.container);
  }
}
