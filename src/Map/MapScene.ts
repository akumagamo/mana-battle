import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {getSquad, getSquadLeader} from '../DB';
import {INVALID_STATE} from '../errors';
import button from '../UI/button';
import {Container, Image} from '../Models';
import panel from '../UI/panel';
import text from '../UI/text';
import {
  getPossibleMoves,
  unitsFromForce as getUnitsFromForce,
  getUnit,
} from '../API/Map/api';
import {Vector, MapUnit, MapState, Force} from '../API/Map/Model';
import {randomItem} from '../defaultData';
import S from 'sanctuary';
import {PLAYER_FORCE, tileMap, CPU_FORCE} from '../API/Map/mocks';

// TODO: error when clicking on enemy unit

const WALKABLE_CELL_TINT = 0x0d4e2b;
const SQUAD_MOVE_DURATION = 500;
const CHARA_MAP_SCALE = 0.5;
const CHARA_VERTICAL_OFFSET = -10;

const BOTTOM_PANEL_X = 0;
const BOTTOM_PANEL_Y = 600;
const BOTTOM_PANEL_WIDTH = 1280;
const BOTTOM_PANEL_HEIGHT = 120;

const cellSize = 100;

const boardPadding = 50;

const walkableTiles = [0];

type MapTile = {
  x: number;
  y: number;
  type: number;
  tile: Image;
};

type MapCommands =
  | {type: 'UPDATE_STATE'; target: MapState}
  | {
      type: 'DESTROY_TEAM';
      target: string;
    };
export class MapScene extends Phaser.Scene {
  charas: Chara[] = [];
  tiles: MapTile[] = [];
  mapContainer: null | Container = null;
  uiContainer: null | Container = null;
  state: MapState | null = null;

  selectedUnit: string | null = null;
  currentForce: string = PLAYER_FORCE;
  /** Units that the player moved this turn*/
  movedUnits: string[] = [];

  // ----- Phaser --------------------
  constructor() {
    super('MapScene');
  }

  updateState(state: MapState) {
    this.state = state;
  }
  // Mutate data before kicking off the scene
  create(data: MapCommands[]) {
    data.forEach((cmd) => {
      if (cmd.type === 'DESTROY_TEAM') {
        S.map((u: MapUnit) => {
          u.status = 'defeated';
        })(this.getUnit(cmd.target));
      } else if (cmd.type === 'UPDATE_STATE') {
        this.updateState(cmd.target);
      }
    });

    console.log(`CREATE`, data);
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

  setValidMoves() {
    if (!this.state) throw new Error(INVALID_STATE);

    const moveList = getPossibleMoves(
      formatDataForApi(this.state)(this.currentForce),
    );

    const units = getUnitsFromForce(this.state)(this.currentForce);

    units.forEach((u) => {
      const resultUnit = S.chain(S.find((unit: MapUnit) => unit.id === u.id))(
        // @ts-ignore
        moveList,
      );

      const moves = S.map(S.prop('validSteps'))(resultUnit);
      const enemies = S.map(S.prop('enemiesInRange'))(resultUnit);
      // @ts-ignore
      u.validSteps = S.fromMaybe([])(moves);
      // @ts-ignore
      u.enemiesInRange = S.fromMaybe([])(enemies);
    });
  }

  getForce(id: string) {
    const force = this.state?.forces.find((force) => force.id === id);
    if (!force) throw new Error(INVALID_STATE);
    return force;
  }

  getUnit(id: string) {
    if (!this.state) throw new Error(INVALID_STATE);
    return getUnit(this.state)(id);
  }

  getCurrentForce() {
    return this.getForce(this.currentForce);
  }

  getPos({x, y}: Vector) {
    return {
      x: boardPadding + x * cellSize,
      y: boardPadding + y * cellSize,
    };
  }

  renderMap() {
    const {container} = this.getContainers();
    this.state?.cells.forEach((arr, col) =>
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
  clearAllTileTint() {
    this.tiles.forEach((tile) => tile.tile.clearTint());
  }
  renderUnits() {
    this.state?.units
      .filter((u) => u.status === 'alive')
      .forEach((unit) => this.renderUnit(unit));
  }

  getCellPositionOnScreen({x, y}: {x: number; y: number}) {
    const pos = this.getPos({x, y});

    return {...pos, y: pos.y + CHARA_VERTICAL_OFFSET};
  }

  renderUnit(unit: MapUnit) {
    const {container} = this.getContainers();
    const leader = getSquadLeader(unit.id);

    const {x, y} = this.getCellPositionOnScreen(unit.pos);

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

    this.charas.push(chara);

    chara.onClick((c: Chara) => {
      this.clearAllTileEvents();
      this.clearAllTileTint();

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
      this.makeCellClickable(this.tileAt(cell.target.x, cell.target.y)),
    );

    unit.enemiesInRange.forEach(({enemy}) => {
      const e = this.getUnit(enemy);
      S.map((e_: MapUnit) => {
        this.tileAt(e_.pos.x, e_.pos.y).tile.setTint(0xff0000);
      })(e);
    });

    this.renderUI();
  }

  handleClickOnEnemyUnit(unit: MapUnit, chara: Chara) {
    if (!this.selectedUnit) return;

    const current = this.getUnit(this.selectedUnit);

    S.map((curr: MapUnit) => {
      const enemy = S.find((e: any) => e.enemy === unit.id)(
        curr.enemiesInRange,
      );
      if (!S.equals(enemy)(S.Nothing)) {
        const alliedChara = this.charas.find((c) => c.unit.id === curr.id);

        if (!alliedChara) return;
        const attack = () => {
          this.turnOff();

          this.scene.transition({
            target: 'CombatScene',
            duration: 0,
            moveBelow: true,
            data: {
              top: chara.unit.squad,
              bottom: this.selectedUnit,
            },
          });
        };

        S.map((e: any) => {
          const target = e.steps;
          this.moveUnit(alliedChara, target, attack);

          // TODO: IO, move to API
          S.map((u: MapUnit) => {
            u.pos = target.reverse()[0];
          })(current);
        })(enemy);
      } else {
        this.selectedUnit = unit.id;
        this.renderUI();
      }
    })(current);
  }

  turnOff() {
    this.mapContainer?.destroy();
    this.uiContainer?.destroy();
    this.charas.forEach((chara) => {
      chara.container?.destroy();
      this.scene.remove(chara);
    });
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
      const squad = getSquad(this.selectedUnit);
      const unit = this.getUnit(this.selectedUnit);

      S.map((u: MapUnit) => {
        text(20, 610, squad.name, uiContainer, this);
        text(1000, 610, `${u.range} cells`, uiContainer, this);
      })(unit);
    }

    button(1100, 50, 'Return to Title', uiContainer, this, () => {
      container.removeAll();
      uiContainer.removeAll();
      this.charas.forEach((c) => this.scene.remove(c.scene.key));
      this.charas = [];
      this.tiles = [];

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });
  }

  switchForce() {
    // TODO: change this, as this works for just 2 forces in state
    const force = this.state?.forces.find(
      (force) => force.id !== this.currentForce,
    );
    if (!force) throw new Error(INVALID_STATE);
    this.currentForce = force.id;
  }

  runTurn() {
    const force = this.getForce(this.currentForce);

    this.showTurnTitle(force);

    this.setValidMoves();

    if (force.id === CPU_FORCE) {
      this.runAiActions(force.id);
    }
  }

  runAiActions(forceId: string) {
    if (!this.state) throw new Error(INVALID_STATE);

    const units = getUnitsFromForce(this.state)(forceId);

    const runAi = (currentTurn: number) => {
      const unit = units[currentTurn];
      if (!unit) throw new Error(INVALID_STATE);

      this.selectedUnit = unit.id;
      this.renderUI();

      const {x, y} = randomItem(unit.validSteps).target;

      const tile = this.getTileAt(x, y);
      this.selectTile(unit.id, tile, () => {
        if (currentTurn === units.length - 1) {
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

  showTurnTitle(force: Force) {
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
    const chara = this.charas.find((c) => c.unit.id === unitId);
    const force = this.getCurrentForce();

    if (!chara || !force) throw new Error(INVALID_STATE);

    const squad = this.state?.units.find(
      (unit) => unit.id === chara.unit.squad,
    );

    if (!squad) throw new Error(INVALID_STATE);

    this.tiles.forEach((tile) =>
      walkableTiles.includes(tile.type) ? tile.tile.clearTint() : null,
    );

    this.movedUnits.push(unitId);

    const maybeUnit = this.getUnit(unitId);

    S.map((unit: MapUnit) => {
      const maybePath = S.find((step: any) => S.equals(step.target)({x, y}))(
        unit.validSteps,
      );

      S.map((step: any) => {
        this.moveUnit(chara, step.steps, onMoveComplete);
      })(maybePath);
    })(maybeUnit);

    // FIXME: local state mutation
    squad.pos.x = x;
    squad.pos.y = y;

    this.renderUI();
  }

  endTurn() {
    this.movedUnits = [];
    this.charas.forEach((u) => u.container?.setAlpha(1));
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

    return enemies.some(({pos: {x, y}}) => x === tile.x && y === tile.y);
  }

  getEnemies() {
    if (!this.state) throw new Error(INVALID_STATE);

    return this.state?.units.filter((unit) => unit.force !== this.currentForce);
  }

  getTileAt(x: number, y: number) {
    const tile = this.tiles.find((tile) => tile.x === x && tile.y === y);

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }
}
const formatDataForApi = (state: MapState) => (currentForce: string) => ({
  units: state.units,
  forces: state.forces,
  width: 14,
  height: 6,
  walkableCells: [0],
  grid: state.cells.map((col) => col.map((cell) => (cell === 0 ? 0 : 1))),
  currentForce: currentForce,
});
