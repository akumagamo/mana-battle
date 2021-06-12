import { Chara } from '../Chara/Model';
import * as Squad from '../Squad/Model';
import { cartesianToIsometric } from '../utils/isometric';
import { BoardTile } from './Model';
import { Graphics } from '../Models';
import { Unit, UnitIndex } from '../Unit/Model';
import { Vector } from '../Map/Model';
import tint from '../Chara/animations/tint';
import onClick from '../Chara/events/onClick';
import createChara from '../Chara/createChara';

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
    public squad: Squad.SquadRecord,
    public units: UnitIndex,
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
    //this.events.on('destroy', ()=>this.destroy(this.scene.scene));)
    this.tiles = this.placeTiles({
      mapWidth: 3,
      mapHeight: 3,
    });
    this.placeUnits();

    // DEBUG DRAG CONTAINER
    //this.makeOverlay();
  }

  turnOff() {
    // TODO: check if this is necessary
    this.tiles.forEach((tile) => tile.sprite.destroy());

    this.unitList.forEach((chara) => {
      const key = this.makeUnitKey(chara.props.unit);
      this.scene.remove(key);
    });
    this.scene.remove(makeId(this.squad));
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

  onClick(fn: (sqd: Squad.SquadRecord) => void) {
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

        const tileSprite = this.add.image(x, y, 'tile');
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

    const pos = this.squad.members.get(unit.id);

    let { x, y } = this.getUnitPositionInScreen(pos);

    x = x * this.scaleSizing + this.x;
    y = y * this.scaleSizing + this.y;

    const key = this.makeUnitKey(unit);
    const chara = createChara({
      parent: this,
      unit,
      x: x,
      y: y,
      scale: this.scaleSizing,
      front: this.front,
      animated: false,
      showHpBar: true,
    });

    if (chara.props.unit.currentHp < 1) tint(chara, 222222);

    return chara;
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

    this.unitList.sort((a, b) => a.container.depth - b.container.depth);
  }
  getUnitPositionInScreen(squadMember: Vector) {
    const x_ = this.front
      ? squadMember.x
      : Squad.invertBoardPosition(squadMember.x);
    const y_ = this.front
      ? squadMember.y
      : Squad.invertBoardPosition(squadMember.y);

    const { x, y } = cartesianToIsometric(x_, y_);

    return { x, y: y - 230 };
  }

  onUnitClick(fn: (c: Chara) => void) {
    this.unitList.forEach((chara) => {
      onClick(chara, () => {
        const pos = this.squad.members.get(chara.props.unit.id);
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

function makeId(squad: Squad.SquadRecord) {
  return `static-squad-${squad.id}`;
}
