import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {Image} from '../Models';
import {preload} from '../preload';
import {SquadMember, Squad} from '../Squad/Model';
import {cartesianToIsometric} from '../utils/isometric';
import {getUnit, changeSquadMemberPosition} from '../DB';
import {Unit} from '../Unit/Model';
import { tileWidth, tileHeight } from '../constants';

type BoardTile = {
  sprite: Image;
  x: number;
  y: number;
  boardX: number;
  boardY: number;
};

export const BOARD_SCENE_KEY = 'BoardScene';

export default class BoardScene extends Phaser.Scene {
  tiles: BoardTile[] = [];
  unitList: Chara[] = [];

  constructor(
    public squad: Squad,
  ) {
    super(BOARD_SCENE_KEY);
    console.log(`boardScene constructor`);
  }

  preload = preload;

  create() {
    this.tiles = this.placeTiles({
      mapWidth: 3,
      mapHeight: 3,
    });
    this.placeUnits();
  }
  findTileByXY(x: number, y: number) {
    return this.tiles.find(
      isPointerInTile({x, y: y + 100}),
    );
  }

  changeUnitPositionInBoard({unit, x, y}: {unit: Unit; x: number; y: number}) {
    const updatedBoard = changeSquadMemberPosition(
      this.squad.members[unit.id],
      this.squad,
      x,
      y,
    );

    this.squad.members = updatedBoard.members;

    console.log(`the received updatedBoard`, updatedBoard);
    //animate updated units

    updatedBoard.updatedUnits.forEach((updatedUnit) => {
      this.moveUnitToBoardTile(updatedUnit.id, updatedUnit.x, updatedUnit.y);
    });
  }
  moveUnitToBoardTile(id: string, x: number, y: number) {

    //TODO: check why params are not being used
    const chara = this.unitList.find((chara) => chara.unit.id === id);

    if (!chara) return;

    const {unit} = chara;

    const pos = getUnitPositionInScreen( this.squad.members[unit.id]);

    const tween = this.tweens.add({
      targets: chara?.container,
      x: pos.x,
      y: pos.y,
      ease: 'Cubic',
      duration: 400,
      repeat: 0,
      paused: false,
      yoyo: false,
    });
    // TODO: optimize, fire only once if multiple units were move at the same time
    tween.on('complete',()=>{this.sortUnitsByDepth()})
  }

  onUnitDragEnd() {
    return (unit: Unit, x: number, y: number) => {
      const {squad} = this;

      console.log(`the squad`, squad);
      console.log(this.tiles, x, y);
      const boardSprite = this.findTileByXY(x, y);

      const squadMember = squad.members[unit.id];

      if (!squadMember)
        throw new Error('Invalid state. Unit should be in board object.');

      const isMoved = (boardSprite: BoardTile) =>
        squadMember.x !== boardSprite.boardX ||
        squadMember.y !== boardSprite.boardY;

      if (boardSprite && isMoved(boardSprite)) {
        this.changeUnitPositionInBoard({
          unit,
          x: boardSprite.boardX,
          y: boardSprite.boardY,
        });
      } else {
        const {x, y} = getUnitPositionInScreen( squadMember);

        // return to original position
        console.log(`TWEEN: return to original`);
        this.tweens.add({
          targets: this.getChara(unit)?.container,
          x: x,
          y: y,
          ease: 'Cubic',
          duration: 400,
          repeat: 0,
          paused: false,
          yoyo: false,
        });
      }

      this.tiles.map((boardSprite) => boardSprite.sprite.clearTint());
      (this.getChara(unit)?.container?.list as Image[]).map((sprite) =>
        sprite.clearTint(),
      );
    };
  }
  private getChara(unit: {id: string}) {
    return this.unitList.find((chara) => chara.key === this.makeUnitKey(unit));
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
        var {x, y} = cartesianToIsometric( xIndex, yIndex);

        const tileSprite = this.add.image(x, y, 'tile');
        tileSprite.depth = y;

        tileSprite.setInteractive();

        tiles.push({
          sprite: tileSprite,
          x,
          y,
          boardX: xIndex + 1,
          boardY: yIndex + 1,
        });
      });
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.tiles
        .filter(isPointerInTile(pointer))
        .forEach((tile) => {
          console.log(`clicked>>`, tile.x, tile.y);
        });
    });

    return tiles;
  }

  addUnitToBoard(squadMember: SquadMember) {
    const {x, y} = getUnitPositionInScreen( squadMember);

    const unit = getUnit(squadMember.id);

    if (!unit) throw new Error('Invalid member supplied');

    const key = this.makeUnitKey(unit);
    const chara = new Chara(
      key,
      this,
      unit,
      x,
      y,
      1,
      true,
      () => {},
      this.onUnitDrag(),
      this.onUnitDragEnd(),
    );

    this.scene.add(key, chara, true);

    return chara;
  }
  onUnitDrag() {
    return (unit: Unit, x: number, y: number) => {
      const boardSprite = this.findTileByXY(x, y);

      this.tiles.map((tile) => tile.sprite.clearTint());

      if (boardSprite) {
        boardSprite.sprite.setTint(0x00cc00);
      }

      this.scene.bringToTop(this.makeUnitKey(unit));
    };
  }

  placeUnits() {
    const {squad} = this;
    console.log(`...`, squad.members);

    Object.values(squad.members).forEach((member) =>
      this.placeUnit({member: member, fromOutside: false}),
    );
  }

  placeUnit({
    member,
    fromOutside,
  }: {
    member: SquadMember;
    fromOutside: boolean;
  }) {
    const chara = this.addUnitToBoard(member);

    this.unitList = this.unitList.concat([chara]);

    this.sortUnitsByDepth();

    if (fromOutside) {
      this.squad.members[member.id] = member;
    }
  }

  private makeUnitKey(unit: {id: string}) {
    return `board-${unit.id}`;
  }

  sortUnitsByDepth() {

    this.unitList
    .forEach(chara=>chara.container?.setDepth(chara.container?.y))

    this.unitList
      .sort((a, b) => (a.container?.depth || 0) - (b.container?.depth || 0))
      .forEach((chara) => chara.scene.bringToTop());
  }
}

function getUnitPositionInScreen(
  squadMember: SquadMember,
) {
  const {x, y} = cartesianToIsometric( squadMember.x, squadMember.y);

  //FIXME: unit should be rendered at origin 0.5
  return {x, y: y - 230};
}

function isPointerInTile(
  pointer: {x: number; y: number}
) {
  return function(tile: BoardTile) {
    const dx = Math.abs(tile.sprite.x - pointer.x);
    const dy = Math.abs(tile.sprite.y - pointer.y);
    const deltaX = dx / tileWidth;
    const deltaY = dy / tileHeight;

    return deltaX + deltaY < 1;
  };
}
