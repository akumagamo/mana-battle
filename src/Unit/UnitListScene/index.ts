import Phaser from "phaser";
import { Unit, UnitIndex } from "../Model";
import { Chara } from "../../Chara/Chara";
import { error, INVALID_STATE } from "../../errors";
import { Text, Container } from "../../Models";
import button from "../../UI/button";
import { Map } from "immutable";

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
  public onDrag: ((unit: Unit, x: number, y: number) => void) | null = null;
  public onDragEnd:
    | ((unit: Unit, x: number, y: number, chara: Chara) => void)
    | null = null;

  constructor(
    public x: number,
    public y: number,
    public itemsPerPage: number,
    public units: UnitIndex
  ) {
    super("UnitListScene");
    this.unitRows = [];
    this.page = 0;
  }

  create() {
    this.events.on("shutdown", () => this.destroy());
    this.render();
    this.renderControls();

    this.game.events.emit("UnitListSceneCreated", this);
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
      this.scene.remove(row.chara.scene.key);
    });
    this.unitRows = [];
    this.units = Map();
  }

  renderControls() {
    this.pagingControls.forEach((destroy) => destroy());

    const baseY = 480;

    const totalUnits = this.units.size;

    if (this.page !== 0) {
      const prev = button(
        this.x-20,
        this.y + baseY,
        " <= ",
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
        " => ",
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
      this.scene.remove(row.chara.props.key);
      this.children.remove(row.container);
    });

    this.unitRows = [];
  }

  getUnitsToRender() {
    return this.units
      .toList()
      .slice(
        this.page * this.itemsPerPage,
        this.page * this.itemsPerPage + this.itemsPerPage
      );
  }

  render() {
    const unitsToRender = this.getUnitsToRender();
    unitsToRender.forEach(this.renderUnitListItem.bind(this));
  }

  private handleUnitClick(unit: Unit) {
    if (this.onUnitClick) {
      console.log(`An event to handle unit click has been defined`, unit);
      this.onUnitClick(unit);
    }
  }

  private handleUnitDrag(unit: Unit, x: number, y: number, chara: Chara) {
    this.scaleUp(chara);
    this.scene.bringToTop(chara.props.key);
    if (this.onDrag) return this.onDrag(unit, x, y);
  }

  private handleUnitDragEnd(unit: Unit, x: number, y: number, chara: Chara) {
    this.renderControls();
    if (this.onDragEnd) this.onDragEnd(unit, x, y, chara);
  }

  private renderUnitListItem(unit: Unit, index: number) {
    const { x, y } = this.getRowPosition(index);
    const key = this.makeUnitKey(unit);

    const container = this.add.container(x, y);

    const onRowClick = this.onUnitClick
      ? this.handleUnitClick.bind(this)
      : undefined;
    const onDrag = this.onDrag ? this.handleUnitDrag.bind(this) : undefined;
    const onDragEnd = this.onDragEnd
      ? this.handleUnitDragEnd.bind(this)
      : undefined;

    var rect = new Phaser.Geom.Rectangle(
      rowOffsetX,
      rowOffsetY,
      rowWidth,
      rowHeight
    );
    const background = this.makeBackground();
    background.setInteractive(rect, Phaser.Geom.Rectangle.Contains);

    container.add(background);

    if (onRowClick) {
      background.on(`pointerdown`, () => {
        onRowClick(unit);
      });
    }

    const chara = new Chara({
      key,
      parent: this,
      unit,
      cx: x,
      cy: y,
      scaleSizing: 0.5,
    });

    if (onDrag && onDragEnd)
      chara.enableDrag(onDrag.bind(this), onDragEnd.bind(this));

    const text = this.add.text(40, 30, unit.name);

    container.add(text);
    //TODO: move background createion to
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

  returnToOriginalPosition(unit: Unit) {
    const index = this.getUnitIndex(unit);

    const row = this.unitRows.find(
      (row) => row.chara.props.key === this.makeUnitKey(unit)
    );

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
      ease: "Cubic",
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
      ease: "Cubic",
      repeat: 0,
      paused: false,
      yoyo: false,
    });
  }

  makeUnitKey(unit: Unit) {
    return "unit-list-" + unit.id;
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
      ease: "Cubic",
      repeat: 0,
      paused: false,
      yoyo: false,
    });

    this.tweens.add({
      targets: container,
      x,
      y,
      duration: 600,
      ease: "Cubic",
      repeat: 0,
      paused: false,
      yoyo: false,
    });
  }

  addUnit(unit: Unit) {
    this.units = this.units.set(unit.id, unit);
  }
  removeUnitFromList(unit: Unit) {
    this.units = this.units.delete(unit.id);

    const findUnit = (row: { chara: Chara; text: Text }): boolean =>
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

    const last = unitsToRender.get(unitsToRender.size - 1);

    const isAlreadyRendered = this.unitRows.some(
      (row) => row.chara.props.unit.id === last.id
    );

    if (isAlreadyRendered) return;

    const newChara = this.renderUnitListItem(last, this.itemsPerPage - 1);

    newChara.container.setPosition(
      newChara.container.x,
      newChara.container.y + 300
    );

    const row = this.unitRows[this.unitRows.length - 1];

    if (!row) return;

    this.reposition(row, this.itemsPerPage - 1);

    this.renderControls();
  }

  private removeUnitRow(row: {
    chara: Chara;
    text: Text;
    container: Container;
  }) {
    this.scene.remove(row.chara);
    this.children.remove(row.container);
  }
}
