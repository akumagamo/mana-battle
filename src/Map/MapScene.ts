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
import {
  Vector,
  MapUnit,
  MapState,
  Force,
  ValidStep,
  EnemyInRange,
} from '../API/Map/Model';
import {randomItem} from '../defaultData';
import S from 'sanctuary';
import {PLAYER_FORCE, tileMap, CPU_FORCE} from '../API/Map/mocks';

const WALKABLE_CELL_TINT = 0x88aa88;
const ENEMY_IN_CELL_TINT = 0xff2222;
const SELECTED_TILE_TINT = 0xffffff;

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
    }
  | {
      type: 'CLICK_CELL';
      cell: MapTile;
    }
  | {
      type: 'CLICK_UNIT';
      unit: MapUnit;
    }
  | {type: 'CLEAR_TILES'}
  | {type: 'CLEAR_TILES_EVENTS'}
  | {type: 'CLEAR_TILES_TINTING'}
  | {type: 'SHOW_UNIT_PANEL'; unit: MapUnit}
  | {type: 'SHOW_CLICKABLE_CELLS'; unit: MapUnit}
  | {type: 'CLOSE_ACTION_PANEL'};

export class MapScene extends Phaser.Scene {
  charas: Chara[] = [];
  tiles: MapTile[] = [];
  mapContainer: null | Container = null;
  uiContainer: null | Container = null;
  actionWindowContainer: null | Container = null;
  state: MapState | null = null;

  selectedUnit: string | null = null;
  currentForce: string = PLAYER_FORCE;
  /** Units that the player moved this turn*/
  movedUnits: string[] = [];

  // ----- Phaser --------------------
  constructor() {
    super('MapScene');
  }

  signal(cmds: MapCommands[]) {
    cmds.forEach((cmd) => {
      console.log(`SIGNAL::`, cmd);
      if (cmd.type === 'DESTROY_TEAM') {
        const unit = this.getUnit(cmd.target);
        // Update unit
        S.map<MapUnit, void>((u) => {
          u.status = 'defeated';
        })(unit);
      } else if (cmd.type === 'UPDATE_STATE') {
        this.updateState(cmd.target);
      } else if (cmd.type === 'CLICK_CELL') {
        S.map<MapUnit, void>((unit) => {
          this.selectTile(unit, cmd.cell, () => this.checkTurnEnd()); // TODO: remove this callback
        })(this.getSelectedUnit());
      } else if (cmd.type === 'CLICK_UNIT') {
        this.clickUnit(cmd.unit);
      } else if (cmd.type === 'CLEAR_TILES') {
        this.clearTiles();
      } else if (cmd.type === 'CLEAR_TILES_EVENTS') {
        this.clearAllTileEvents();
      } else if (cmd.type === 'CLEAR_TILES_TINTING') {
        this.clearAllTileTint();
      } else if (cmd.type === 'SHOW_UNIT_PANEL') {
        this.showUnitPanel(cmd.unit);
      } else if (cmd.type === 'SHOW_CLICKABLE_CELLS') {
        this.showClickableCellsForUnit(cmd.unit);
      } else if (cmd.type === 'CLOSE_ACTION_PANEL') {
        this.closeActionWindow();
      }
    });
  }

  updateState(state: MapState) {
    this.state = state;
  }
  // Mutate data before kicking off the scene
  create(data: MapCommands[]) {
    this.signal(data);

    console.log(`CREATE`, data);
    this.mapContainer = this.add.container(0, 0);
    this.uiContainer = this.add.container(0, 0);
    this.actionWindowContainer = this.add.container(0, 0);

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
        moveList,
      );

      const moves = S.map<MapUnit, ValidStep[]>((u) => u.validSteps)(
        resultUnit,
      );
      const enemies = S.map<MapUnit, EnemyInRange[]>((u) => u.enemiesInRange)(
        resultUnit,
      );

      S.map<ValidStep[], void>((steps) => {
        u.validSteps = steps;
      })(moves);
      S.map<EnemyInRange[], void>((e) => {
        u.enemiesInRange = e;
      })(enemies);
    });
  }

  getForce(id: string) {
    const force = this.state?.forces.find((force) => force.id === id);
    if (!force) throw new Error(INVALID_STATE);
    return force;
  }

  getUnit(id: string) {
    if (!this.state) return S.Nothing;
    return getUnit(this.state)(id);
  }

  getDefeatedForces(): string[] {
    if (!this.state) throw new Error(INVALID_STATE);
    return this.state.forces
      .map((f) => f.id)
      .reduce((xs, x) => {
        if (!this.state) throw new Error(INVALID_STATE);
        const allDefeated = this.state.units
          .filter((u) => u.force === x)
          .every((u) => u.status === 'defeated');

        if (allDefeated) return xs.concat([x]);
        else return xs;
      }, [] as string[]);
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

        const tile = this.add.image(x, y, `tiles/${tileMap[n]}`);

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
  getSelectedUnit() {
    if (this.selectedUnit) return this.getUnit(this.selectedUnit);
    else return S.Nothing;
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on('pointerdown', () => {
      this.signal([{type: 'CLICK_CELL', cell}]);
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
      this.signal([
        {
          type: 'CLICK_UNIT',
          unit,
        },
      ]);
    });
  }

  clickUnit(unit: MapUnit) {

    if (unit.force === PLAYER_FORCE) {
      this.handleClickOnOwnUnit(unit);
    } else {
      this.handleClickOnEnemyUnit(unit);
    }
  }

  showClickableCellsForUnit(unit: MapUnit) {
    this.clearTiles();
    unit.validSteps.forEach((cell) =>
      this.makeCellClickable(this.tileAt(cell.target.x, cell.target.y)),
    );

    unit.enemiesInRange.forEach(({enemy}) => {
      const e = this.getUnit(enemy);
      S.map((e_: MapUnit) => {
        this.tileAt(e_.pos.x, e_.pos.y).tile.setTint(ENEMY_IN_CELL_TINT);
      })(e);
    });
  }

  getChara(unitId: string) {
    return S.find<Chara>((c) => c.unit.id === unitId)(this.charas);
  }

  handleClickOnOwnUnit(unit: MapUnit) {
    this.signal([
      {type: 'SHOW_UNIT_PANEL', unit},
      {type: 'SHOW_CLICKABLE_CELLS', unit},
    ]);
  }

  handleClickOnEnemyUnit(enemyUnit: MapUnit) {
    const maybeSelectedUnit = this.getSelectedUnit();

    if (S.isNothing(maybeSelectedUnit)) {
      this.signal([{type: 'SHOW_UNIT_PANEL', unit: enemyUnit}]);
    } else {
      S.map<MapUnit, void>((selectedUnit) => {
        S.map<Chara, void>((chara_) => {

          const isInRange = S.elem(enemyUnit.id)(S.map<EnemyInRange,string>(e=>e.enemy)(selectedUnit.enemiesInRange))

           if (selectedUnit.force === PLAYER_FORCE && isInRange) {
            this.showEnemyUnitMenu(enemyUnit, chara_, selectedUnit);
            this.signal([{type: 'SHOW_CLICKABLE_CELLS', unit: selectedUnit}]);
          } else {
            this.signal([{type: 'SHOW_UNIT_PANEL', unit: enemyUnit}]);
          }
        })(this.getChara(enemyUnit.id));
      })(maybeSelectedUnit);
    }
  }

  showUnitPanel(unit: MapUnit) {
    this.selectedUnit = unit.id;
    this.renderUI();
  }

  showEnemyUnitMenu(unit: MapUnit, chara: Chara, selectedAlly: MapUnit) {
    const lineHeight = 50;
    const paddingTop = 20;
    const height = (n: number) => paddingTop + lineHeight * n;
    this.closeActionWindow();
    this.actionWindowContainer = this.add.container(
      chara.container?.x,
      chara.container?.y,
    );
    const bg = panel(0, 0, 100, 180, this.actionWindowContainer, this);
    this.actionWindowContainer.add(bg);
    button(20, height(0), 'Attack', this.actionWindowContainer, this, () => {
      this.moveToEnemyUnit(unit, chara, selectedAlly);
    });
    button(20, height(1), 'View', this.actionWindowContainer, this, () => {
      console.log(unit);
    });
    button(20, height(2), 'Cancel', this.actionWindowContainer, this, () => {
      this.closeActionWindow();
    });
  }

  moveToEnemyUnit(enemyUnit: MapUnit, chara: Chara, selectedAlly: MapUnit) {
    const enemy = S.find<EnemyInRange>((e) => e.enemy === enemyUnit.id)(
      selectedAlly.enemiesInRange,
    );
    if (S.isJust(enemy)) {
      const alliedChara = this.charas.find(
        (c) => c.unit.id === selectedAlly.id,
      );

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
        })(selectedAlly);
      })(enemy);
    } else {
      console.error(`This should be impossible, check logic`);
      this.showUnitPanel(enemyUnit);
    }
  }
  turnOff() {
    this.mapContainer?.destroy();
    this.uiContainer?.destroy();
    this.charas.forEach((chara) => {
      chara.container?.destroy();
      this.scene.remove(chara);
    });
    this.charas = [];
    this.tiles.forEach((tile) => {
      tile.tile.destroy();
    });
    this.tiles = [];
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
    // One side won last turn?
    const defeatedForces = this.getDefeatedForces();

    if (defeatedForces.includes(PLAYER_FORCE)) console.log(`player loses!`);
    if (defeatedForces.includes(CPU_FORCE)) console.log(`player wins!`);

    const force = this.getForce(this.currentForce);

    this.showTurnTitle(force);

    this.setValidMoves();

    if (force.id === CPU_FORCE) {
      this.runAiActions(force.id);
    }
  }

  runAiActions(forceId: string) {
    if (!this.state) throw new Error(INVALID_STATE);

    const units_ = getUnitsFromForce(this.state)(forceId);

    const units = units_.filter((u) => u.status === 'alive');

    const runAi = (currentTurn: number) => {
      const unit = units[currentTurn];
      if (!unit) throw new Error(INVALID_STATE);

      this.selectedUnit = unit.id;
      this.renderUI();

      const {x, y} = randomItem(unit.validSteps).target;

      const tile = this.getTileAt(x, y);
      this.selectTile(unit, tile, () => {
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

  clearTiles() {
    this.clearAllTileTint();
    this.clearAllTileEvents();
  }

  closeActionWindow() {
    this.actionWindowContainer?.destroy();
  }
  selectTile(unit: MapUnit, mapTile: MapTile, onMoveComplete: Function) {
    // Destroy existing window
    // Clear all tiles
    // Repaint tiles
    // hightlight selected
    // show menu

    const {tile} = mapTile;

    if (!this.mapContainer) return;

    this.closeActionWindow();

    this.signal([{type: 'SHOW_CLICKABLE_CELLS', unit}]);

    tile.setTint(SELECTED_TILE_TINT);

    this.actionWindow(tile.x, tile.y, 100, 120, [
      {
        title: 'Move',
        action: () => {
          this.moveToTile(unit.id, mapTile, onMoveComplete);
          this.actionWindowContainer?.destroy();
          tile.clearTint();
        },
      },
      {
        title: 'Cancel',
        action: () => {
          this.closeActionWindow();
          this.signal([{type: 'SHOW_CLICKABLE_CELLS', unit}]);
        },
      },
    ]);
  }

  actionWindow(
    x: number,
    y: number,
    width: number,
    height: number,
    actions: {title: string; action: () => void}[],
  ) {
    if (this.actionWindowContainer) this.actionWindowContainer.destroy();
    this.actionWindowContainer = this.add.container(x, y);
    const bg = panel(0, 0, width, height, this.actionWindowContainer, this);
    this.actionWindowContainer.add(bg);
    actions.forEach(({title, action}, index) => {
      if (this.actionWindowContainer)
        button(20, index * 50, title, this.actionWindowContainer, this, action);
    });
  }

  moveToTile(unitId: string, mapTile: MapTile, onMoveComplete: Function) {
    const {x, y} = mapTile;

    // Move unit to tile
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
  units: state.units.filter((u) => u.status === 'alive'),
  forces: state.forces,
  width: 14,
  height: 6,
  walkableCells: [0],
  grid: state.cells.map((col) => col.map((cell) => (cell === 0 ? 0 : 1))),
  currentForce: currentForce,
});
