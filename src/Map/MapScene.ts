import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {preload} from '../preload';
import {Squad} from '../Squad/Model';
import {
  addUnitToSquad,
  getUnits,
  getUnit,
  getSquad,
  getSquadLeader,
} from '../DB';
import UnitListScene from '../Unit/UnitListScene';
import {Unit} from '../Unit/Model';
import BoardScene, {BOARD_SCENE_KEY} from '../Board/InteractiveBoardScene';
import {INVALID_STATE} from '../errors';
import button from '../UI/button';
import {Container, Image} from '../Models';
import * as easyStar from 'easystarjs';

const easystar = new easyStar.js();

const cellSize = 100;

const boardPadding = 100;

const Map: MapBoard = {
  cells: [
    [0, 1, 0, 1, 1, 1],
    [0, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 1],
    [0, 0, 0, 1, 1, 1],
  ],
  forces: [
    {id: '0', name: 'player', squads: [{id: '0', x: 0, y: 0}]},
    {id: '1', name: 'CPU', squads: [{id: '3', x: 3, y: 2}]},
  ],
};

type MapBoard = {
  cells: number[][];
  forces: MapForce[];
};
type MapForce = {id: string; name: string; squads: MapSquad[]};
type MapSquad = {
  id: string;
  x: number;
  y: number;
};

export class MapScene extends Phaser.Scene {
  squads: Chara[] = [];

  tiles: {x: number; y: number; type:number; tile: Image}[] = [];
  selectedUnit: string | null = null;

  constructor() {
    super('MapScene');
  }

  preload = preload;

  getPos(x: number, y: number) {
    return {
      x: boardPadding + x * cellSize,
      y: boardPadding + y * cellSize,
    };
  }

  renderMap(container: Container) {
    console.log(`MapScene - renderMap`);

    Map.cells.forEach((arr, col) =>
      arr.forEach((n, row) => {
        const {x, y} = this.getPos(row, col);
        const tile = this.add.image(x, y, 'panel');

        tile.setInteractive();
        tile.on('pointerdown', () => {
          if (this.selectedUnit) {
            this.selectTile(this.selectedUnit, row, col);
          }
        });

        container.add(tile);

        if (n === 1) tile.setTint(0xdeaa87);

        tile.displayWidth = cellSize;
        tile.displayHeight = cellSize;

        this.tiles.push({
          x: row,
          y: col,
          type: n,
          tile: tile,
        });
      }),
    );
  }
  renderUnits(container: Container) {
    console.log(`MapScene - renderUnits`);

    Map.forces.forEach((force) => {
      force.squads.forEach((sqd) => this.renderSquad(container, sqd));
    });
  }

  renderSquad(container: Container, squad: MapSquad) {
    const leader = getSquadLeader(squad.id);
    if (!leader) return;

    const chara = new Chara(
      'chara' + leader.id,
      this,
      leader,
      boardPadding + squad.x * cellSize,
      boardPadding + squad.y * cellSize,
      0.5,
      true,
    );

    if (chara.container) container.add(chara.container);

    this.squads.push(chara);

    chara.onClick((c: Chara) => {
      console.log(`selected`, c);
      this.selectedUnit = chara.unit.id;
    });
  }

  renderUI(container: Container) {
    console.log(`MapScene - renderUI`);
    button(1100, 50, 'Return to Title', this.add.container(0, 0), this, () => {
      this.squads.forEach((c) => this.scene.remove('chara' + c.unit.id));
      container.destroy();
      this.squads = [];
      this.tiles = [];

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });
  }
  create() {
    console.log(`MapScene - create`);
    const container = this.add.container(0, 0);
    this.renderMap(container);
    this.renderUnits(container);
    this.renderUI(container);
  }

  selectTile(unitId: string, row: number, col: number) {
    console.log(`MapScene - selectTile`);
    const chara = this.squads.find((c) => c.unit.id === unitId);
    const force = Map.forces.find((force) => force.id === '0');

    if (!chara || !force) throw new Error(INVALID_STATE);

    const charaPos = force.squads.find(
      (squad) => squad.id === chara.unit.squad,
    );

    if (!charaPos) throw new Error(INVALID_STATE);

    easystar.setGrid(Map.cells);
    easystar.setAcceptableTiles([0]);


    this.tiles.forEach(tile=>tile.type === 0?tile.tile.clearTint(): null)

    easystar.findPath(charaPos.x, charaPos.y, row, col, (path) => {

      path.forEach((pos, index) => {

        if(index === 0) return
      const tile = this.getTileAt(pos.x,pos.y)

      tile.tile.setTint(0x5555cc)
        return
        /**
          if (index == 0) return;
        const target = this.getPos(pos.x, pos.y);
        this.tweens.add({
          targets: chara.container,
          x: target.x,
          y: target.y,
          duration: 500,
          delay: (index - 1) * 500,
        });
        **/
      });
    });
    easystar.calculate();
  }
  getTileAt(x: number, y: number) {
    const tile = this.tiles.find((tile) => tile.x === x && tile.y === y);

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }
}
