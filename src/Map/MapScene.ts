import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {getSquad, getSquadLeader} from '../DB';
import {INVALID_STATE} from '../errors';
import button from '../UI/button';
import {Container, Image} from '../Models';
import * as easyStar from 'easystarjs';
import panel from '../UI/panel';
import text from '../UI/text';
import {identity} from '../utils/functional';
import {getPossibleMoves} from './api';

const PLAYER_FORCE = 'PLAYER_FORCE';
const CPU_FORCE = 'CPU_FORCE';
const WALKABLE_CELL_TINT = 0x0d4e2b;
const SQUAD_MOVE_RANGE = 3;
const SQUAD_MOVE_DURATION = 500;
const CHARA_MAP_SCALE = 0.5;
const CHARA_VERTICAL_OFFSET = -10;

const BOTTOM_PANEL_X = 0;
const BOTTOM_PANEL_Y = 600;
const BOTTOM_PANEL_WIDTH = 1280;
const BOTTOM_PANEL_HEIGHT = 120;

const easystar = new easyStar.js();

const cellSize = 100;

const boardPadding = 50;

// 0-> grass
// 1-> woods
// 2-> mountain
//

const walkableTiles = [0];

const Map: MapBoard = {
  cells: [
    [0, 1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
  ],
  forces: [
    {
      id: PLAYER_FORCE,
      name: 'Player',
      units: [
        {id: '0', x: 0, y: 0, range: 5, validMoves: [], force: PLAYER_FORCE},
      ],
    },
    {
      id: CPU_FORCE,
      name: 'CPU',
      units: [
        {id: '1', x: 0, y: 3, range: 5, validMoves: [], force: CPU_FORCE},
        {id: '2', x: 3, y: 1, range: 5, validMoves: [], force: CPU_FORCE},
      ],
    },
  ],

  cities: [
    {id: 'a1', name: 'Arabella', x: 1, y: 1, force: PLAYER_FORCE},

    {id: 'm1', name: 'Marqueze', x: 3, y: 1, force: CPU_FORCE},
  ],
};
export type Vector = {x: number; y: number};
type MapBoard = {
  cells: number[][];
  forces: MapForce[];
  cities: MapCity[];
};
type MapForce = {id: string; name: string; units: MapUnit[]};
type MapUnit = {
  id: string;
  x: number;
  y: number;
  range: number;
  validMoves: Vector[];
  force: string;
};
type MapCity = {
  id: string;
  name: string;
  x: number;
  y: number;
  force: string | null;
};

type MapTile = {
  x: number;
  y: number;
  type: number;
  tile: Image;
};
export class MapScene extends Phaser.Scene {
  units: Chara[] = [];
  tiles: MapTile[] = [];
  selectedUnit: string | null = null;
  currentForce: string = PLAYER_FORCE;

  tileAt(x: number, y: number) {
    const tile = this.tiles.find((t) => t.x === x && t.y === y);
    if (!tile) throw new Error(INVALID_STATE);
    return tile;
  }
  getValidMoves() {
    const units = getPossibleMoves({
      units: Map.forces
        .map((f) =>
          f.units.map((u) => ({
            id: u.id,
            range: u.range,
            force: f.id,
            pos: {x: u.x, y: u.y},
            validSteps: [],
          })),
        )
        .flat(),
      forces: Map.forces.map((f) => ({
        id: f.id,
        units: f.units.map((u) => u.id),
      })),
      width: 14,
      height: 6,
      walkableCells: [0],
      grid: Map.cells.map((col) => col.map((cell) => (cell === 0 ? 0 : 1))),
      currentForce: PLAYER_FORCE,
    });

    let force = Map.forces.find((f) => f.id === this.currentForce);

    if (!force) throw new Error(INVALID_STATE);

    force.units.forEach((u) => {
      // @ts-ignore
      const resultUnit = units.find((unit) => unit.id === u.id);

      if (!resultUnit) throw new Error(INVALID_STATE);

      // @ts-ignore
      u.validMoves = resultUnit.validSteps;
    });
  }

  getForce(id: string) {
    const force = Map.forces.find((force) => force.id === id);
    if (!force) throw new Error(INVALID_STATE);
    return force;
  }
  getForceUnit(force: MapForce, id: string) {
    const unit = force.units.find((f) => f.id === id);

    if (!unit) throw new Error(INVALID_STATE);

    return unit;
  }
  constructor() {
    super('MapScene');
  }

  getPos({x, y}: Vector) {
    return {
      x: boardPadding + x * cellSize,
      y: boardPadding + y * cellSize,
    };
  }

  renderMap(container: Container, uiContainer: Container) {
    Map.cells.forEach((arr, col) =>
      arr.forEach((n, row) => {
        const {x, y} = this.getPos({x: row, y: col});

        const makeTile = () => {
          //TODO: refactor, this is bad and ugly
          if (n === 0) return this.add.image(x, y, 'tiles/grass');
          else if (n === 1) return this.add.image(x, y, 'tiles/woods');
          else if (n === 2) return this.add.image(x, y, 'tiles/mountain');
          else return this.add.image(x, y, 'tiles/grass');
        };

        const tile = makeTile();

        tile.setInteractive();

        container.add(tile);

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
  makeInteractive(container: Container, uiContainer: Container, cell: MapTile) {
    cell.tile.on('pointerdown', () => {
      if (this.selectedUnit) {
        this.selectTile(container, uiContainer, this.selectedUnit, cell);
      }
    });
  }
  clearAllTileEvents() {
    this.tiles.forEach((tile) => tile.tile.removeAllListeners());
  }
  renderUnits(container: Container, uiContainer: Container) {
    Map.forces.forEach((force) => {
      force.units.forEach((unit) =>
        this.renderUnit(force, container, uiContainer, unit),
      );
    });
  }

  getCharaPosition({x, y}: {x: number; y: number}) {
    const pos = this.getPos({x, y});

    return {...pos, y: pos.y + CHARA_VERTICAL_OFFSET};
  }

  renderUnit(
    force: MapForce,
    container: Container,
    uiContainer: Container,
    unit: MapUnit,
  ) {
    const leader = getSquadLeader(unit.id);
    if (!leader) return;

    const {x, y} = this.getCharaPosition(unit);

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

    this.units.push(chara);

    chara.onClick((c: Chara) => {
      if (unit.force === PLAYER_FORCE) {
        this.selectedUnit = unit.id;

        const cells = unit.validMoves.forEach((cell) => {
          this.findPath(unit, cell).then((path) => {
            this.makeCellClickable(
              this.tileAt(cell.x, cell.y),
              path,
              container,
              uiContainer,
            );
          });
        });

        this.refreshUI(container, uiContainer);
      } else {
        Map.forces
          .filter((force) => force.id === PLAYER_FORCE)
          .forEach((force) =>
            force.units
              .filter((force) => force.id === this.selectedUnit)
              .forEach((playerSquad) => {
                const distance = this.getDistance(playerSquad, unit);

                console.log(distance);
                if (distance === 1) {
                  console.log(`attack!!`, unit);

                  this.scene.transition({
                    target: 'CombatScene',
                    duration: 0,
                    moveBelow: true,
                    data: {
                      top: chara.unit.squad,
                      bottom: this.selectedUnit,
                    },
                  });
                }
              }),
          );
      }
    });
  }

  private makeCellClickable(
    cell: MapTile,
    path: Vector[],
    container: Phaser.GameObjects.Container,
    uiContainer: Phaser.GameObjects.Container,
  ) {
    cell.tile.setTint(WALKABLE_CELL_TINT);
    this.makeInteractive(container, uiContainer, cell);
  }

  refreshUI(container: Container, uiContainer: Container) {
    this.renderUI(container, uiContainer);
  }

  renderUI(container: Container, uiContainer: Container) {
    uiContainer.removeAll();

    uiContainer.add(
      panel(
        BOTTOM_PANEL_X,
        BOTTOM_PANEL_Y,
        BOTTOM_PANEL_WIDTH,
        BOTTOM_PANEL_HEIGHT,
        uiContainer,
        this,
      ),
    );

    if (this.selectedUnit) {
      const force = this.getForce(this.currentForce);

      const squad = getSquad(this.selectedUnit);
      const forceSquad = this.getForceUnit(force, this.selectedUnit);

      text(20, 610, squad.name, uiContainer, this);

      text(1000, 610, `${forceSquad.range} cells`, uiContainer, this);
    }

    button(1100, 50, 'Return to Title', uiContainer, this, () => {
      container.removeAll();
      this.units.forEach((c) => this.scene.remove(c.scene.key));
      this.units = [];
      this.tiles = [];

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });
  }
  create() {
    const container = this.add.container(0, 0);
    const uiContainer = this.add.container(0, 0);
    this.renderMap(container, uiContainer);
    this.renderUnits(container, uiContainer);
    this.renderUI(container, uiContainer);

    this.runTurn();
  }

  runTurn() {
    const force = this.getForce(this.currentForce);

    const title = this.add.text(-200, 500, `${force.name} Turn`);

    const timeline = this.tweens.createTimeline();
    timeline.add({
      targets: title,
      x: 700,
      ease: 'Bounce',
      duration: 500,
    });
    timeline.add({
      targets: title,
      x: 800,
      duration: 1500,
    });
    timeline.add({
      targets: title,
      x: 1700,
      duration: 500,
    });

    timeline.play();

    this.getValidMoves();
  }

  tilesInRange(x: number, y: number, range: number) {
    return this.tiles.filter((tile) => this.getDistance({x, y}, tile) <= range);
  }

  getDistance(source: Vector, target: Vector) {
    return Math.abs(target.x - source.x) + Math.abs(target.y - source.y);
  }

  selectTile(
    container: Container,
    uiContainer: Container,
    unitId: string,
    {x, y}: MapTile,
  ) {
    const chara = this.units.find((c) => c.unit.id === unitId);
    const force = Map.forces.find((force) => force.id === PLAYER_FORCE);

    if (!chara || !force) throw new Error(INVALID_STATE);

    const squad = force.units.find((squad) => squad.id === chara.unit.squad);

    if (!squad) throw new Error(INVALID_STATE);

    this.tiles.forEach((tile) =>
      walkableTiles.includes(tile.type) ? tile.tile.clearTint() : null,
    );

    this.findPath(squad, {x, y}).then((path) => this.moveUnit(chara, path));

    // FIXME: local state mutation
    squad.x = x;
    squad.y = y;

    this.refreshUI(container, uiContainer);
    this.clearAllTileEvents();
  }

  moveUnit = (chara: Chara, path: Vector[]) => {
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
          ease: 'Cubic',
          onComplete: index === path.length - 2 ? endCallback() : null,
        };
      });

    this.tweens.timeline({tweens});
  };

  isEnemyInTile(tile: Vector) {
    const enemies = this.getEnemies();

    return enemies.some((enemy) => enemy.x === tile.x && enemy.y === tile.y);
  }

  getEnemies() {
    return Map.forces
      .filter((force) => force.id !== PLAYER_FORCE)
      .map((force) => force.units)
      .flat();
  }

  findPath = (origin: Vector, target: Vector): Promise<Vector[]> => {
    let cells = Map.cells.map((row) => row.map(identity));

    const enemies = this.getEnemies();

    enemies.forEach((sqd) => {
      cells[sqd.y][sqd.x] = 1;
    });

    easystar.setGrid(cells);
    easystar.setAcceptableTiles(walkableTiles);

    return new Promise((resolve, reject) => {
      easystar.findPath(origin.x, origin.y, target.x, target.y, (path) => {
        if (path) resolve(path);
        else reject();
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
