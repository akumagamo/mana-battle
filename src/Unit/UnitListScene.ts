import Phaser from "phaser";
import { Unit, unitsWithoutSquad } from "./Model";
import { getUnitsFromDB } from "../DB";
import { Chara } from "../Chara/Chara";
import { error, INVALID_STATE } from "../errors";
import { Pointer, Text, Image, Container } from "../Models";

// TODO: fix list display when unit in board is replaced with unit from list
//

const rowWidth = 200;
const rowHeight = 90;
const rowOffsetY = -30;
const rowOffsetX = -50;

export default class UnitListScene extends Phaser.Scene {
  public rows: { chara: Chara; text: Text; container: Container }[];
  private page: number;
  private controls: Image[] = [];
  public onUnitClick: ((unit: Unit) => void) | null = null;
  public onDrag: ((unit: Unit, x: number, y: number) => void) | null = null;
  public onDragEnd:
    | ((unit: Unit, x: number, y: number, chara: Chara) => void)
    | null = null;

  constructor(public x: number, public y: number, public itemsPerPage: number) {
    super("UnitListScene");
    this.rows = [];
    this.page = 0;
  }

  create() {
    this.render();
    this.renderControls();
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
    this.rows.forEach((row) =>
      this.scene.remove(this.makeUnitKey(row.chara.props.unit))
    );
    this.scene.remove();
  }

  renderControls() {
    this.controls.forEach((btn) => btn.destroy());

    // TODO: optimize to avoid reloading this
    const units = unitsWithoutSquad(getUnitsFromDB());
    const totalUnits = Object.keys(units).length;

    const next = this.add.image(this.x + 100, this.y + 580, "arrow_right");

    const isLastPage =
      totalUnits < this.itemsPerPage ||
      this.itemsPerPage * (this.page + 1) >= totalUnits;

    if (!isLastPage) {
      next.setInteractive();
      next.on("pointerdown", (_: Pointer) => {
        this.nextPage();
      });
    } else {
      next.setAlpha(0.5);
    }

    const prev = this.add.image(this.x, this.y + 580, "arrow_right");
    prev.setScale(-1, 1);

    if (this.page === 0) {
      prev.setAlpha(0.5);
    } else {
      prev.setInteractive();
      prev.on("pointerdown", (_: Pointer) => {
        this.prevPage();
      });
    }

    this.controls = [next, prev];
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
    this.rows.forEach((row) => {
      this.scene.remove(row.chara.props.key);
      this.children.remove(row.container);
    });

    this.rows = [];
  }

  getUnitsToRender() {
    const units = unitsWithoutSquad(getUnitsFromDB());

    return units
      .toList()
      .slice(
        this.page * this.itemsPerPage,
        this.page * this.itemsPerPage + this.itemsPerPage
      );
  }

  render() {
    const unitsToRender = this.getUnitsToRender();

    console.log(`....`, unitsToRender);
    unitsToRender.forEach((unit, index) => {
      this.renderUnitListItem(unit, index);
    });
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
    const { charaX, charaY } = this.getRowPosition(index);
    const key = this.makeUnitKey(unit);

    const container = this.add.container(charaX, charaY);

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

    const chara = new Chara({key, parent: this, unit, cy: charaX, cx: charaY, scaleSizing: 0.5, front: true});

    if (onDrag && onDragEnd)
      chara.enableDrag(onDrag.bind(this), onDragEnd.bind(this));

    const text = this.add.text(40, 30, unit.name);

    container.add(text);
    //TODO: move background createion to
    this.rows.push({ chara, text, container });

    return chara;
  }

  private getRowPosition(index: number) {
    const lineHeight = 100;
    return {
      charaX: this.x,
      charaY: this.y + lineHeight * index,
    };
  }

  private getUnitIndex(unit: Unit) {
    return this.rows.findIndex((row) => row.chara.props.unit.id === unit.id);
  }

  returnToOriginalPosition(unit: Unit) {
    const index = this.getUnitIndex(unit);

    const row = this.rows.find(
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
    const { charaX, charaY } = this.getRowPosition(index);

    this.tweens.add({
      targets: chara.container,
      x: charaX,
      y: charaY,
      duration: 600,
      ease: "Cubic",
      repeat: 0,
      paused: false,
      yoyo: false,
    });

    this.tweens.add({
      targets: container,
      x: charaX,
      y: charaY,
      duration: 600,
      ease: "Cubic",
      repeat: 0,
      paused: false,
      yoyo: false,
    });
  }

  removeUnit(unit: Unit) {
    const findUnit = (row: { chara: Chara; text: Text }): boolean =>
      row.chara.props.unit.id === unit.id;
    this.rows.filter(findUnit).forEach((row) => {
      this.scene.remove(row.chara);
      this.children.remove(row.container);
    });

    this.rows = this.rows.filter((row) => !findUnit(row));
    this.rows.forEach((row, index) => this.reposition(row, index));


    const unitsToRender = this.getUnitsToRender();

    if (unitsToRender.size < 1) return;

    const last = unitsToRender.get(unitsToRender.size - 1);

    const isAlreadyRendered = this.rows.some(
      (row) => row.chara.props.unit.id === last.id
    );

    if (isAlreadyRendered) return;

    const newChara = this.renderUnitListItem(last, this.itemsPerPage - 1);

    if (newChara.container)
      newChara.container.setPosition(
        newChara.container.x,
        newChara.container.y + 300
      );

    const row = this.rows[this.rows.length - 1];

    if (!row) return;

    this.reposition(row, this.itemsPerPage - 1);
  }
}
