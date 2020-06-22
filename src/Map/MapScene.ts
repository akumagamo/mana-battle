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
import {Vector} from './Models';
import {randomItem} from '../defaultData';

const PLAYER_FORCE = 'PLAYER_FORCE';
const CPU_FORCE = 'CPU_FORCE';
const WALKABLE_CELL_TINT = 0x0d4e2b;
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

const walkableTiles = [0];

const tileMap: {[x in CellNumber]: string} = {
  0: 'grass',
  1: 'woods',
  2: 'mountain',
};

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
        {id: '0', x: 0, y: 0, range: 5, validSteps: [], force: PLAYER_FORCE},

        {id: '1', x: 3, y: 2, range: 5, validSteps: [], force: PLAYER_FORCE},
      ],
    },
    {
      id: CPU_FORCE,
      name: 'CPU',
      units: [
        {id: '2', x: 0, y: 3, range: 5, validSteps: [], force: CPU_FORCE},
        {id: '3', x: 3, y: 1, range: 5, validSteps: [], force: CPU_FORCE},
      ],
    },
  ],

  cities: [
    {id: 'a1', name: 'Arabella', x: 1, y: 1, force: PLAYER_FORCE},
    {id: 'm1', name: 'Marqueze', x: 3, y: 1, force: CPU_FORCE},
  ],
};
type CellNumber = 0 | 1 | 2;
type MapBoard = {
  cells: CellNumber[][];
  forces: MapForce[];
  cities: MapCity[];
};
type MapForce = {id: string; name: string; units: MapUnit[]};
type MapUnit = {
  id: string;
  x: number;
  y: number;
  range: number;
  validSteps: Vector[];
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
  mapContainer: null | Container = null;
  uiContainer: null | Container = null;

  selectedUnit: string | null = null;
  currentForce: string = PLAYER_FORCE;
  /** Units that the player moved this turn*/
  movedUnits: string[] = [];

  // ----- Phaser --------------------
  constructor() {
    super('MapScene');
  }
  create() {
    this.mapContainer = this.add.container(0, 0);
    this.uiContainer = this.add.container(0, 0);

    this.renderMap();
    this.renderUnits();
    this.renderUI();

    this.runTurn();
  }

  // ------ Internals ----------------

  getContainers() {
    if (!this.mapContainer || !this.uiContainer) throw new Error(INVALID_STATE);

    return {container: this.mapContainer, uiContainer: this.uiContainer};
  }

  tileAt(x: number, y: number) {
    const tile = this.tiles.find((t) => t.x === x && t.y === y);
    if (!tile) throw new Error(INVALID_STATE);
    return tile;
  }
  getValidMoves() {
    const moveList: MapUnit[] = getPossibleMoves(
      formatDataForApi(this.currentForce),
    );

    let force = Map.forces.find((f) => f.id === this.currentForce);

    if (!force) throw new Error(INVALID_STATE);

    force.units.forEach((u) => {
      const resultUnit = moveList.find((unit) => unit.id === u.id);

      if (!resultUnit) throw new Error(INVALID_STATE);

      u.validSteps = resultUnit.validSteps;
    });
  }

  getForce(id: string) {
    const force = Map.forces.find((force) => force.id === id);
    if (!force) throw new Error(INVALID_STATE);
    return force;
  }

  getCurrentForce() {
    return this.getForce(this.currentForce);
  }
  getForceUnit(force: MapForce, id: string) {
    const unit = force.units.find((f) => f.id === id);

    if (!unit) throw new Error(INVALID_STATE);

    return unit;
  }

  getPos({x, y}: Vector) {
    return {
      x: boardPadding + x * cellSize,
      y: boardPadding + y * cellSize,
    };
  }

  renderMap() {
    const {container} = this.getContainers();
    Map.cells.forEach((arr, col) =>
      arr.forEach((n, row) => {
        const {x, y} = this.getPos({x: row, y: col});

        const makeTile = () => {
          return this.add.image(x, y, `tiles/${tileMap[n]}`);
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
  makeInteractive(cell: MapTile) {
    cell.tile.on('pointerdown', () => {
      if (this.selectedUnit) {
        this.selectTile(this.selectedUnit, cell, () => this.checkTurnEnd());
        this.clearAllTileEvents();
      }
    });
  }
  clearAllTileEvents() {
    this.tiles.forEach((tile) => tile.tile.removeAllListeners());
  }
  renderUnits() {
    Map.forces.forEach((force) => {
      force.units.forEach((unit) => this.renderUnit(force, unit));
    });
  }

  getCellPositionOnScreen({x, y}: {x: number; y: number}) {
    const pos = this.getPos({x, y});

    return {...pos, y: pos.y + CHARA_VERTICAL_OFFSET};
  }

  renderUnit(force: MapForce, unit: MapUnit) {
    const {container, uiContainer} = this.getContainers();
    const leader = getSquadLeader(unit.id);

    const {x, y} = this.getCellPositionOnScreen(unit);

    const chara = new Chara(
      `unit-${unit.id}`,
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
        this.handleClickOnOwnUnit(unit);
      } else {
        this.handleClickOnEnemyUnit(unit, c);
      }
    });
  }

  handleClickOnOwnUnit(unit: MapUnit) {
    this.selectedUnit = unit.id;

    unit.validSteps.forEach((cell) =>
      this.makeCellClickable(this.tileAt(cell.x, cell.y)),
    );

    this.renderUI();
  }

  handleClickOnEnemyUnit(unit: MapUnit, chara: Chara) {
    this.selectedUnit = unit.id;
    this.renderUI();

    Map.forces
      .filter((force) => force.id === PLAYER_FORCE)
      .forEach((force) =>
        force.units
          .filter((force) => force.id === this.selectedUnit)
          .forEach((playerSquad) => {
            const distance = this.getDistance(playerSquad, unit);

            if (distance === 1) {
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

  private makeCellClickable(cell: MapTile) {
    cell.tile.setTint(WALKABLE_CELL_TINT);
    this.makeInteractive(cell);
  }

  renderUI() {
    const {container, uiContainer} = this.getContainers();
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
      uiContainer.removeAll();
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

  switchForce() {
    const force = Map.forces.find((force) => force.id !== this.currentForce);
    if (!force) throw new Error(INVALID_STATE);
    this.currentForce = force.id;
  }

  runTurn() {
    const force = this.getForce(this.currentForce);

    this.showTurnTitle(force);

    this.getValidMoves();

    if (force.id === CPU_FORCE) {
      this.runAiActions(force);
    }
  }

  runAiActions(force: MapForce) {
    const runAi = (currentTurn: number) => {
      const unit = force.units[currentTurn];
      if (!unit) throw new Error(INVALID_STATE);

      this.selectedUnit = unit.id;
      this.renderUI();

      const {x, y} = randomItem(unit.validSteps);

      const tile = this.getTileAt(x, y);
      this.selectTile(unit.id, tile, () => {
        if (currentTurn === force.units.length - 1) {
          this.endTurn();
        } else {
          runAi(currentTurn + 1);
        }
      });
    };

    runAi(0);
  }

  checkTurnEnd() {
    const force = this.getCurrentForce();

    if (this.movedUnits.length === force.units.length) this.endTurn();
  }

  showTurnTitle(force: MapForce) {
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
  }

  tilesInRange(x: number, y: number, range: number) {
    return this.tiles.filter((tile) => this.getDistance({x, y}, tile) <= range);
  }

  getDistance(source: Vector, target: Vector) {
    return Math.abs(target.x - source.x) + Math.abs(target.y - source.y);
  }

  selectTile(unitId: string, {x, y}: MapTile, onMoveComplete: Function) {
    const {container, uiContainer} = this.getContainers();
    const chara = this.units.find((c) => c.unit.id === unitId);
    const force = Map.forces.find((force) => force.id === this.currentForce);

    if (!chara || !force) throw new Error(INVALID_STATE);

    const squad = force.units.find((squad) => squad.id === chara.unit.squad);

    if (!squad) throw new Error(INVALID_STATE);

    this.tiles.forEach((tile) =>
      walkableTiles.includes(tile.type) ? tile.tile.clearTint() : null,
    );

    this.movedUnits.push(unitId);

    this.findPath(squad, {x, y}).then((path) =>
      this.moveUnit(chara, path, onMoveComplete),
    );

    // FIXME: local state mutation
    squad.x = x;
    squad.y = y;

    this.renderUI();
  }

  endTurn() {
    this.movedUnits = [];
    this.units.forEach((u) => u.container?.setAlpha(1));
    this.switchForce();
    this.runTurn();
  }

  moveUnit = (chara: Chara, path: Vector[], onMoveComplete: Function) => {
    const endCallback = () => {
      path.forEach((p) => this.getTileAt(p.x, p.y).tile.clearTint());

      onMoveComplete();
    };

    const tweens = path
      .filter((_, index) => index > 0)
      .map((pos) => {
        const target = this.getCellPositionOnScreen(pos);
        return {
          targets: chara.container,
          x: target.x,
          y: target.y,
          duration: SQUAD_MOVE_DURATION,
          ease: 'Cubic',
        };
      })
      .concat([
        {
          targets: chara.container,
          duration: 200,

          // @ts-ignore
          alpha: 0.2,
          onComplete: endCallback.bind(this),
        },
      ]);

    return this.tweens.timeline({tweens});
  };

  isEnemyInTile(tile: Vector) {
    const enemies = this.getEnemies();

    return enemies.some((enemy) => enemy.x === tile.x && enemy.y === tile.y);
  }

  getEnemies() {
    return Map.forces
      .filter((force) => force.id !== this.currentForce)
      .map((force) => force.units)
      .flat();
  }

  // todo: remove this, api should provide valid cells
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
const formatDataForApi = (currentForce: string) => ({
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
  currentForce: currentForce,
});
