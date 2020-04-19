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
import {Container} from '../Models';

const cellSize = 100;

const boardPadding = 100;

const Map: MapBoard = {
  cells: [
    [0, 0, 0, 1, 1, 1],
    [0, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 1],
    [0, 0, 0, 1, 1, 1],
  ],
  forces: [
    {id: '0', name: 'player', squads: [{id: '0', x: 1, y: 1}]},
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

  selectedUnit: string | null = null;

  constructor() {
    super('MapScene');
  }

  preload = preload;

  getPos(x:number,y:number){

  return{

         x : boardPadding + x * cellSize,
         y : boardPadding + y * cellSize
  }

  }

  renderMap(container: Container) {
    console.log(`MapScene - renderMap`);

    Map.cells.forEach((arr, col) =>
      arr.forEach((n, row) => {
        const {x,y} = this.getPos(row,col)
        const tile = this.add.image(x, y, 'panel');

        tile.setInteractive();
        tile.on('pointerdown', () => {
          if (this.selectedUnit) {
            this.moveUnit(this.selectedUnit, row, col);
          }
        });

        container.add(tile);

        if (n === 1) tile.setTint(0xdeaa87);

        tile.displayWidth = cellSize;
        tile.displayHeight = cellSize;
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

  moveUnit(unitId: string, row: number, col: number) {
    console.log(`MapScene - moveUnit`);
    const chara = this.squads.find((c) => c.unit.id === unitId);

    if (!chara) throw new Error(INVALID_STATE);

    const {x,y} = this.getPos(row,col)

    this.tweens.add({
      targets: chara.container,
      x: x,
      y: y,
      duration: 500,
      onComplete: () => {
        console.log(`combat!`);
      },
    });
  }
}
