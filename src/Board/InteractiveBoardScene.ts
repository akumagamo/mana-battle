import { Chara } from "../Chara/Chara";
import { Image } from "../Models";
import * as Squad from "../Squad/Model";
import { cartesianToIsometric } from "../utils/isometric";
import { Unit, UnitIndex } from "../Unit/Model";
import { tileWidth, tileHeight } from "../constants";
import { Map } from "immutable";
import onEnableDrag from "../Chara/events/onEnableDrag";

type BoardTile = {
  sprite: Image;
  x: number;
  y: number;
  boardX: number;
  boardY: number;
};

export const BOARD_SCENE_KEY = "BoardScene";

export default class BoardScene extends Phaser.Scene {
  tiles: BoardTile[] = [];
  unitList: Chara[] = [];

  constructor(
    public squad: Squad.SquadRecord,
    public onSquadUpdated: (
      squad: Squad.SquadRecord,
      added: string[],
      removed: string[]
    ) => void,
    public unitIndex: UnitIndex,
    public showHpBars: boolean
  ) {
    super(BOARD_SCENE_KEY);
  }

  create() {
    this.tiles = this.placeTiles({
      mapWidth: 3,
      mapHeight: 3,
    });
    this.placeUnits();
  }
  findTileByXY(x: number, y: number) {
    return this.tiles.find(isPointerInTile({ x, y: y + 100 }));
  }

  changeUnitPositionInBoard({
    unit,
    x,
    y,
  }: {
    unit: Unit;
    x: number;
    y: number;
  }) {
    const updatedSquad = Squad.updateMember(
      this.squad,
      Squad.makeMember({ id: unit.id, x, y })
    );

    this.onSquadUpdated(updatedSquad, [], []);
    this.squad = updatedSquad;

    //animate updated units
    updatedSquad.members.forEach((updatedUnit) => {
      this.moveUnitToBoardTile(updatedUnit.id);
    });
  }
  moveUnitToBoardTile(id: string) {
    const chara = this.unitList.find((chara) => chara.props.unit.id === id);

    if (!chara) return;

    const { unit } = chara.props;

    const pos = getUnitPositionInScreen(Squad.getMember(unit.id, this.squad));

    const tween = this.tweens.add({
      targets: chara?.container,
      x: pos.x,
      y: pos.y,
      ease: "Cubic",
      duration: 400,
      repeat: 0,
      paused: false,
      yoyo: false,
    });
    // TODO: optimize, fire only once if multiple units were move at the same time
    tween.on("complete", () => {
      this.sortUnitsByDepth();
    });
  }

  onUnitDragEnd = (unit: Unit, x: number, y: number) => {
    const { squad } = this;

    const boardSprite = this.findTileByXY(x, y);

    const squadMember = Squad.getMember(unit.id, squad);

    if (!squadMember)
      throw new Error("Invalid state. Unit should be in board object.");

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
      const { x, y } = getUnitPositionInScreen(squadMember);

      // return to original position
      this.tweens.add({
        targets: this.getChara(unit)?.container,
        x: x,
        y: y,
        ease: "Cubic",
        duration: 400,
        repeat: 0,
        paused: false,
        yoyo: false,
      });
      this.tiles.forEach((sprite) => {
        if (sprite.boardX === squadMember.x && sprite.boardY === squadMember.y)
          this.highlightTile(sprite);
        else sprite.sprite.clearTint();
      });
    }
  };
  private getChara(unit: { id: string }) {
    return this.unitList.find(
      (chara) => chara.props.key === this.makeUnitKey(unit)
    );
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
        var { x, y } = cartesianToIsometric(xIndex, yIndex);

        const tileSprite = this.add.image(x, y, "tile");
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

    //this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    //  //this.tiles.filter(isPointerInTile(pointer)).forEach((tile) => {});
    //});

    return tiles;
  }

  addUnitToBoard(squadMember: Squad.MemberRecord) {
    const { x, y } = getUnitPositionInScreen(squadMember);

    const unit = this.getUnit(squadMember.id);

    if (!unit) throw new Error("Invalid member supplied.");

    const key = this.makeUnitKey(unit);
    const chara = new Chara({
      key,
      parent: this,
      unit,
      cx: x,
      cy: y,
      showHpBar: this.showHpBars,
    });

    onEnableDrag(chara, this.onUnitDrag.bind(this), this.onUnitDragEnd.bind(this))

    return chara;
  }

  getUnit(id: string) {
    return this.unitIndex.get(id);
  }

  makeUnitsClickable(fn: (u: Chara) => void) {
    this.unitList.forEach((chara) => {
      chara.onClick((c) => {
        const member = Squad.findMember(
          (mem) => mem.id === chara.props.unit.id,
          this.squad
        );

        const tile = this.tiles.find(
          (t) => t.boardX === member.x && t.boardY === member.y
        );
        if (tile) this.highlightTile(tile);
        fn(c);
      });
    });
  }

  onUnitDrag = (unit: Unit, x: number, y: number) => {
    const tile = this.findTileByXY(x, y);

    if (tile) {
      this.highlightTile(tile);
    }
    this.scene.bringToTop(this.makeUnitKey(unit));
  };

  highlightTile(boardSprite: BoardTile) {
    this.tiles.forEach((tile) => tile.sprite.clearTint());

    boardSprite.sprite.setTint(0x00cc00);
  }
  placeUnits() {
    const { squad } = this;

    squad.members.forEach((member) =>
      this.placeUnit({ member: member, fromOutside: false })
    );
  }

  placeUnit({
    member,
    fromOutside,
  }: {
    member: Squad.MemberRecord;
    fromOutside: boolean;
  }) {
    const chara = this.addUnitToBoard(member);

    this.unitList = this.unitList.concat([chara]);

    this.sortUnitsByDepth();

    if (fromOutside) {
      this.squad = Squad.updateMember(this.squad, member);
    }
  }

  private makeUnitKey(unit: { id: string }) {
    return `board-${unit.id}`;
  }

  sortUnitsByDepth() {
    this.unitList.forEach((chara) =>
      chara.container.setDepth(chara.container?.y)
    );

    this.unitList
      .sort((a, b) => (a.container?.depth || 0) - (b.container?.depth || 0))
      .forEach((chara) => chara.scene.bringToTop());
  }
  destroy() {
    this.tiles.forEach((tile) => tile.sprite.destroy());

    this.unitList.forEach((chara) => this.scene.remove(chara.scene.key));
    this.tiles = [];
    this.unitList = [];

    this.unitIndex = Map();
    this.events.destroy();
    this.scene.remove(this);
  }
}

function getUnitPositionInScreen(squadMember: Squad.MemberRecord) {
  const { x, y } = cartesianToIsometric(squadMember.x, squadMember.y);

  //FIXME: unit should be rendered at origin 0.5
  return { x, y: y - 230 };
}

function isPointerInTile(pointer: { x: number; y: number }) {
  return function (tile: BoardTile) {
    const dx = Math.abs(tile.sprite.x - pointer.x);
    const dy = Math.abs(tile.sprite.y - pointer.y);
    const deltaX = dx / tileWidth;
    const deltaY = dy / tileHeight;

    return deltaX + deltaY < 1;
  };
}
