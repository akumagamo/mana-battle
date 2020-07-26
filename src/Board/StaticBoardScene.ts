import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {SquadMember, Squad} from '../Squad/Model';
import {cartesianToIsometric} from '../utils/isometric';
import {getUnit} from '../DB';
import {BoardTile} from './Model';
import {Graphics} from '../Models';

const BOARD_WIDTH = 250;
const BOARD_HEIGHT = 150;

const OFFSET_X = 60;
const OFFSET_Y = 40;

export default class StaticBoardScene extends Phaser.Scene {
  tiles: BoardTile[] = [];
  unitList: Chara[] = [];
  overlay: Graphics | null = null;

  constructor(
    public squad: Squad,
    public x: number,
    public y: number,
    public scaleSizing: number,
  ) {
    super(makeId(squad));
  }

  create() {
    this.tiles = this.placeTiles({
      mapWidth: 3,
      mapHeight: 3,
    });
    this.placeUnits();

    // DEBUG DRAG CONTAINER
    this.makeOverlay();
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
      BOARD_HEIGHT,
    );
    var graphics = this.add.graphics({
      //fillStyle: {color: 0x0000ff},
    });

    graphics.alpha = 0.2;

    graphics.fillRectShape(rect);
    this.overlay = graphics;
  }

  onClick(fn: (sqd: Squad) => void) {
    var rect = new Phaser.Geom.Rectangle(
      this.x + OFFSET_X,
      this.y + OFFSET_Y,
      BOARD_WIDTH,
      BOARD_HEIGHT,
    );
    this.overlay?.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
    this.overlay?.on(`pointerdown`, () => {
      fn(this.squad);
    });
  }

  placeTiles({mapWidth, mapHeight}: {mapWidth: number; mapHeight: number}) {
    var grid: null[][] = [[]];
    let tiles: BoardTile[] = [];

    for (var x = 0; x < mapWidth; x++) {
      grid[x] = [];
      for (var y = 0; y < mapHeight; y++) grid[x][y] = null;
    }

    grid.forEach((row, yIndex) => {
      row.forEach((_, xIndex) => {
        let {x, y} = cartesianToIsometric(xIndex, yIndex);

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

  addUnitToBoard(squadMember: SquadMember) {
    let {x, y} = this.getUnitPositionInScreen(squadMember);

    x = x * this.scaleSizing + this.x;
    y = y * this.scaleSizing + this.y;

    const unit = getUnit(squadMember.id);

    if (!unit) throw new Error('Invalid member supplied');

    const key = this.makeUnitKey(unit);
    const chara = new Chara(key, this, unit, x, y, this.scaleSizing, true);

    return chara;
  }

  placeUnits() {
    const {squad} = this;

    Object.values(squad.members).forEach((member) => this.placeUnit(member));
  }

  placeUnit(member: SquadMember) {
    const chara = this.addUnitToBoard(member);

    this.unitList = this.unitList.concat([chara]);

    this.sortUnitsByDepth();
  }

  private makeUnitKey(unit: {id: string}) {
    return `board-unit-${unit.id}`;
  }

  sortUnitsByDepth() {
    this.unitList.forEach((chara) =>
      chara.container.setDepth(chara.container?.y),
    );

    this.unitList
      .sort((a, b) => (a.container?.depth || 0) - (b.container?.depth || 0))
      .forEach((chara) => chara.scene.bringToTop());
  }
  getUnitPositionInScreen(squadMember: SquadMember) {
    const {x, y} = cartesianToIsometric(squadMember.x, squadMember.y);

    return {x, y: y - 230};
  }
}

function makeId(squad: Squad) {
  return `static-squad-${squad.id}`;
}
