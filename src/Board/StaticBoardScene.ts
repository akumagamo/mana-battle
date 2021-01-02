import * as Phaser from "phaser";
import { Chara } from "../Chara/Chara";
import { Squad } from "../Squad/Model";
import { cartesianToIsometric } from "../utils/isometric";
import { BoardTile } from "./Model";
import { Graphics } from "../Models";
import { Unit } from "../Unit/Model";
import { Vector } from "matter";
import { invertBoardPosition } from "../Combat/utils";

const BOARD_WIDTH = 250;
const BOARD_HEIGHT = 150;

const OFFSET_X = 60;
const OFFSET_Y = 40;

export default class StaticBoardScene extends Phaser.Scene {
  tiles: BoardTile[] = [];
  unitList: Chara[] = [];
  overlay: Graphics | null = null;
  isSelected = false;
  constructor(
    public squad: Squad,
    public units: Unit[],
    public x: number,
    public y: number,
    public scaleSizing: number,
    public front = true
  ) {
    super(makeId(squad));
  }

  select() {
    this.isSelected = true;
    this.tiles.forEach((tile) => tile.sprite.setTint(0x558899));
  }
  deselect() {
    this.isSelected = false;
    this.tiles.forEach((t) => t.sprite.clearTint());
  }

  create() {
    this.tiles = this.placeTiles({
      mapWidth: 3,
      mapHeight: 3,
    });
    this.placeUnits();

    // DEBUG DRAG CONTAINER
    //this.makeOverlay();
  }

  destroy(parentScene: Phaser.Scene) {
    // For some reason, this.scene returns null after the scene is recreated...
    // so I am passing the "parent" scene as a reference
    console.log(`lets remove a board`, this);
    this.tiles.forEach((tile) => tile.sprite.destroy());

    this.unitList.forEach((chara) => {
      const key = this.makeUnitKey(chara.unit);
      parentScene.scene.remove(key);
    });

    console.log(`removing board scene`, this.scene.key);
    parentScene.scene.remove(makeId(this.squad));
  }

  makeOverlay() {
    var rect = new Phaser.Geom.Rectangle(
      this.x + OFFSET_X,
      this.y + OFFSET_Y,
      BOARD_WIDTH,
      BOARD_HEIGHT
    );
    var graphics = this.add.graphics({
      fillStyle: { color: 0x0000ff },
    });

    graphics.alpha = 0.2;

    graphics.fillRectShape(rect);
    this.overlay = graphics;
  }

  onClick(fn: (sqd: Squad) => void) {
    var clickZone = this.add.zone(
      this.x + OFFSET_X,
      this.y + OFFSET_Y,
      BOARD_WIDTH,
      BOARD_HEIGHT
    );
    clickZone.setInteractive();
    clickZone.setOrigin(0);
    clickZone.on(`pointerup`, () => {
      fn(this.squad);
    });
  }

  placeTiles({ mapWidth, mapHeight }: { mapWidth: number; mapHeight: number }) {
    var grid: null[][] = [[]];
    let tiles: BoardTile[] = [];

    for (var x = 0; x < mapWidth; x++) {
      grid[x] = [];
      for (var y = 0; y < mapHeight; y++) grid[x][y] = null;
    }

    grid.forEach((row, yIndex) => {
      row.forEach((_, xIndex) => {
        let { x, y } = cartesianToIsometric(xIndex, yIndex);

        x = x * this.scaleSizing + this.x;
        y = y * this.scaleSizing + this.y;

        const tileSprite = this.add.image(x, y, "tile");
        tileSprite.scale = this.scaleSizing;
        tileSprite.depth = y;

        tiles.push({
          sprite: tileSprite,
          x,
          y,
          boardX: xIndex + 1,
          boardY: yIndex + 1,
        });
      });
    });

    return tiles;
  }

  addUnitToBoard(unit: Unit) {
    if (!unit.squad) return;

    const pos = this.squad.members[unit.id];

    let { x, y } = this.getUnitPositionInScreen(pos);

    x = x * this.scaleSizing + this.x;
    y = y * this.scaleSizing + this.y;

    const key = this.makeUnitKey(unit);
    return new Chara(
      key,
      this,
      unit,
      x,
      y,
      this.scaleSizing,
      this.front,
      false,
      false,
      true
    );
  }

  placeUnits() {
    this.units.forEach((member) => this.placeUnit(member));
  }

  placeUnit(member: Unit) {
    const chara = this.addUnitToBoard(member);

    if (!chara) return;

    this.unitList = this.unitList.concat([chara]);

    this.sortUnitsByDepth();
  }

  private makeUnitKey(unit: { id: string }) {
    return `board-unit-${unit.id}`;
  }

  sortUnitsByDepth() {
    this.unitList.forEach((chara) =>
      chara.container.setDepth(chara.container?.y)
    );

    this.unitList
      .sort((a, b) => (a.container?.depth || 0) - (b.container?.depth || 0))
      .forEach((chara) => chara.scene.bringToTop());
  }
  getUnitPositionInScreen(squadMember: Vector) {
    const x_ = this.front ? squadMember.x : invertBoardPosition(squadMember.x);
    const y_ = this.front ? squadMember.y : invertBoardPosition(squadMember.y);

    const { x, y } = cartesianToIsometric(x_, y_);

    return { x, y: y - 230 };
  }

  onUnitClick(fn: (c: Chara) => void) {
    this.unitList.forEach((chara) => {
      chara.onClick(() => {
        const pos = this.squad.members[chara.unit.id];
        this.highlightTile(pos);
        fn(chara);
      });
    });
  }

  highlightTile({ x, y }: { x: number; y: number }): void {
    this.tiles.forEach((tile) => tile.sprite.clearTint());

    this.tiles
      .filter((t) => t.boardX === x && t.boardY === y)
      .map((t) => t.sprite.setTint(0x00cc00));
  }
}

function makeId(squad: Squad) {
  return `static-squad-${squad.id}`;
}
