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
  saveSquad,
} from '../DB';
import UnitListScene from '../Unit/UnitListScene';
import {Unit} from '../Unit/Model';
import BoardScene, {BOARD_SCENE_KEY} from '../Board/InteractiveBoardScene';
import {INVALID_STATE} from '../errors';
import button from '../UI/button';
import {Container, Image} from '../Models';
import * as easyStar from 'easystarjs';
import panel from '../UI/panel';
import text from '../UI/text';
import {identity} from '../utils/functional';

const PLAYER_FORCE = '0';
const WALKABLE_CELL_TINT = 0x99ff99;
const SQUAD_MOVE_RANGE = 3;
const SQUAD_MOVE_DURATION = 500;
const CHARA_MAP_SCALE = 0.5;
const CHARA_VERTICAL_OFFSET = -10;

const BOTTOM_PANEL_X = 0;
const BOTTOM_PANEL_Y = 600;
const BOTTOM_PANEL_WIDTH = 1280;
const BOTTOM_PANEL_HEIGHT = 120;

const MOUNTAIN_TINT = 0xdeaa87;

const easystar = new easyStar.js();

const cellSize = 100;

const boardPadding = 100;

const Map: MapBoard = {
  cells: [
    [0, 0, 0, 0, 0, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  ],
  forces: [
    {id: PLAYER_FORCE, name: 'Player', squads: [{id: '0', x: 0, y: 0}]},
    {
      id: '1',
      name: 'CPU',
      squads: [
        {id: '2', x: 3, y: 2},
        {id: '3', x: 3, y: 1},
        {id: '4', x: 4, y: 2},
        {id: '5', x: 4, y: 1},
        {id: '6', x: 3, y: 0},
      ],
    },
  ],
};
type Coordinate = {x: number; y: number};
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

type MapTile = {x: number; y: number; type: number; tile: Image};
export class MapScene extends Phaser.Scene {
  squads: Chara[] = [];

  tiles: MapTile[] = [];
  selectedSquad: string | null = null;

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

  renderMap(container: Container, uiContainer: Container) {
    console.log(`MapScene - renderMap`);

    Map.cells.forEach((arr, col) =>
      arr.forEach((n, row) => {
        const {x, y} = this.getPos(row, col);
        const tile = this.add.image(x, y, 'panel');

        tile.setInteractive();
        tile.on('pointerdown', () => {
          if (this.selectedSquad) {
            this.selectTile(uiContainer, this.selectedSquad, row, col);
          }
        });

        container.add(tile);

        if (n === 1) tile.setTint(MOUNTAIN_TINT);

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
  renderUnits(container: Container, uiContainer: Container) {
    console.log(`MapScene - renderUnits`);

    Map.forces.forEach((force) => {
      force.squads.forEach((sqd) =>
        this.renderSquad(force, container, uiContainer, sqd),
      );
    });
  }

  getCharaPosition({x, y}: {x: number; y: number}) {
    const pos = this.getPos(x, y);

    return {...pos, y: pos.y + CHARA_VERTICAL_OFFSET};
  }

  renderSquad(
    force: MapForce,
    container: Container,
    uiContainer: Container,
    squad: MapSquad,
  ) {
    const leader = getSquadLeader(squad.id);
    if (!leader) return;

    const {x, y} = this.getCharaPosition(squad);

    const chara = new Chara(
      'chara' + leader.id,
      this,
      leader,
      x,
      y,
      CHARA_MAP_SCALE,
      true,
    );

    if (chara.container) container.add(chara.container);

    this.squads.push(chara);

    chara.onClick((c: Chara) => {
      if (force.id === PLAYER_FORCE) {
        this.selectedSquad = c.unit.squad;

        const cells = this.tilesInRange(squad.x, squad.y, SQUAD_MOVE_RANGE)
          .filter((tile) => tile.type === 0)
          .filter((tile) => !this.isEnemyInTile(tile));

        cells.forEach((cell, index) => {
          if (index > 0)
            this.findPath(squad, cell).then((path) => {
              if (path && path.length <= SQUAD_MOVE_RANGE + 1) {
                cell.tile.setTint(WALKABLE_CELL_TINT);
              }
            });
        });

        this.refreshUI(uiContainer);
      } else {
        Map.forces
          .filter((force) => force.id === PLAYER_FORCE)
          .forEach((force) =>
            force.squads
              .filter((force) => force.id === this.selectedSquad)
              .forEach((playerSquad) => {
                const distance = this.getDistance(playerSquad, squad);

                if (distance === 1) {
                  console.log(`attack!!`, squad);

                  this.scene.transition({
                    target: 'CombatScene',
                    duration: 0,
                    moveBelow: true,
                    data: {
                      top: chara.unit.squad,
                      bottom: this.selectedSquad,
                    },
                  });
                }
              }),
          );
      }
    });
  }

  refreshUI(container: Container) {
    container.destroy();

    this.renderUI(this.add.container(0, 0));
  }

  renderUI(container: Container) {
    console.log(`MapScene - renderUI`);

    container.add(
      panel(
        BOTTOM_PANEL_X,
        BOTTOM_PANEL_Y,
        BOTTOM_PANEL_WIDTH,
        BOTTOM_PANEL_HEIGHT,
        container,
        this,
      ),
    );

    if (this.selectedSquad) {
      const squad = getSquad(this.selectedSquad);
      if (squad) {
        text(10, 610, squad.name, container, this);
      }
    }

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
    const uiContainer = this.add.container(0, 0);
    this.renderMap(container, uiContainer);
    this.renderUnits(container, uiContainer);
    this.renderUI(uiContainer);
  }

  tilesInRange(x: number, y: number, range: number) {
    return this.tiles.filter((tile) => this.getDistance({x, y}, tile) <= range);
  }

  getDistance(source: Coordinate, target: Coordinate) {
    return Math.abs(target.x - source.x) + Math.abs(target.y - source.y);
  }

  selectTile(uiContainer: Container, unitId: string, x: number, y: number) {
    console.log(`MapScene - selectTile`);
    const chara = this.squads.find((c) => c.unit.id === unitId);
    const force = Map.forces.find((force) => force.id === PLAYER_FORCE);

    if (!chara || !force) throw new Error(INVALID_STATE);

    const squad = force.squads.find((squad) => squad.id === chara.unit.squad);

    if (!squad) throw new Error(INVALID_STATE);

    this.tiles.forEach((tile) =>
      tile.type === 0 ? tile.tile.clearTint() : null,
    );

    this.findPath(squad, {x, y}).then((path) => this.moveUnit(chara, path));

    // FIXME: local state mutation
    squad.x = x;
    squad.y = y;
  }

  moveUnit = (chara: Chara, path: Coordinate[]) => {
    const endCallback = () => {
      path.forEach((p) => this.getTileAt(p.x, p.y).tile.clearTint());
    };
    const tweens = path
      .filter((_, index) => index > 0)
      .map((pos, index) => {
        const target = this.getCharaPosition(pos);
        return {
          targets: chara.container,
          x: target.x,
          y: target.y,
          duration: SQUAD_MOVE_DURATION,
          onComplete: index === path.length - 2 ? endCallback() : null,
        };
      });

    this.tweens.timeline({tweens});
  };

  isEnemyInTile(tile: Coordinate) {
    const enemies = this.getEnemies();

    return enemies.some((enemy) => enemy.x === tile.x && enemy.y === tile.y);
  }

  getEnemies() {
    return Map.forces
      .filter((force) => force.id !== PLAYER_FORCE)
      .map((force) => force.squads)
      .flat();
  }

  findPath = (
    origin: Coordinate,
    target: Coordinate,
  ): Promise<Coordinate[]> => {
    let cells = Map.cells.map((row) => row.map(identity));

    const enemies = this.getEnemies();

    enemies.forEach((sqd) => {
      cells[sqd.y][sqd.x] = 1;
    });

    console.log(cells, Map.cells);

    easystar.setGrid(cells);
    easystar.setAcceptableTiles([0]);

    return new Promise((resolve) => {
      easystar.findPath(origin.x, origin.y, target.x, target.y, (path) => {
        resolve(path);
      });
      easystar.calculate();
    });
  };
  getTileAt(x: number, y: number) {
    const tile = this.tiles.find((tile) => tile.x === x && tile.y === y);

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }
}
