import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {preload} from '../preload';
import {SquadMember, Squad} from '../Squad/Model';
import {cartesianToIsometric} from '../utils/isometric';
import {getUnit, changeSquadMemberPosition} from '../DB';
import {Unit} from '../Unit/Model';
import {BoardTile} from './Model';
import {Container} from '../Models';

export default class BoardScene extends Phaser.Scene {
  tiles: BoardTile[] = [];
  unitList: Chara[] = [];
  container: Container | null = null

  constructor(public squad: Squad,
  public x:number,
  public y:number,
  public scaleSizing:number,

  ) {
    super(`static-squad-${squad.id}`);
    console.log(`static board scene constructor`);
  }

  preload = preload;

  create() {
    this.tiles = this.placeTiles({
      mapWidth: 3,
      mapHeight: 3,
    });
    this.placeUnits();
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

        x = x * this.scaleSizing + this.x
        y = y * this.scaleSizing + this.y

        const tileSprite = this.add.image(x, y, 'tile');
        tileSprite.scale = this.scaleSizing
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

    x = x * this.scaleSizing + this.x
    y = y * this.scaleSizing + this.y

    const unit = getUnit(squadMember.id);

    if (!unit) throw new Error('Invalid member supplied');

    const key = this.makeUnitKey(unit);
    const chara = new Chara(key, this, unit, x, y, this.scaleSizing, true);

    this.scene.add(key, chara, true);

    return chara;
  }

  placeUnits() {
    const {squad} = this;
    console.log(`...`, squad.members);

    Object.values(squad.members).forEach((member) => this.placeUnit(member));
  }

  placeUnit(member: SquadMember) {
    const chara = this.addUnitToBoard(member);

    this.unitList = this.unitList.concat([chara]);

    this.sortUnitsByDepth();
  }

  private makeUnitKey(unit: {id: string}) {
    return `board-${unit.id}`;
  }

  sortUnitsByDepth() {
    this.unitList.forEach((chara) =>
      chara.container?.setDepth(chara.container?.y),
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
