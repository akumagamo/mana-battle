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
const SELECTED_TILE_TINT = 0x9955aa;

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
  | {type: 'UPDATE_UNIT_POS'; id: string; pos: Vector}
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
  | {type: 'HIGHLIGHT_CELL'; pos: Vector}
  | {type: 'CLOSE_ACTION_PANEL'}
  | {type: 'END_UNIT_TURN'}
  | {type: 'RUN_TURN'};

export class MapScene extends Phaser.Scene {
  charas: Chara[] = [];
  tiles: MapTile[] = [];

  // Containers can't be created in the constructor, so we are casting the types here
  // TODO: consider receiving containers from parent or pass them around in functions
  mapContainer: Container = {} as Container;
  uiContainer: Container = {} as Container;

  actionWindowContainer: null | Container = null;
  state: MapState = {} as MapState;
  selectedUnit: string | null = null;
  currentForce: string = PLAYER_FORCE;
  /** Units moved by a force in a given turn */
  movedUnits: string[] = [];

  // ----- Phaser --------------------
  constructor() {
    super('MapScene');
  }

  signal(cmds: MapCommands[]) {
    cmds.forEach((cmd) => {
      console.log(`SIGNAL::`, cmd);
      if (cmd.type === 'DESTROY_TEAM') {
this.unitIO((u) => {
                u.status = 'defeated';
                this.movedUnits = S.reject<string>((id) => id === u.id)(
                  this.movedUnits,
                );
              })(cmd.target);
        const animation = () =>
          this.charaIO((chara) => {
            chara.fadeOut(() => { });
          })(cmd.target);
        this.time.addEvent({
          delay: 100,
          callback: () => animation(),
        });
      } else if (cmd.type === 'UPDATE_STATE') {
        this.updateState(cmd.target);
      } else if (cmd.type === 'UPDATE_UNIT_POS') {
        this.state.units = this.state.units.map((unit) =>
          unit.id === cmd.id ? {...unit, pos: cmd.pos} : unit,
        );
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
      } else if (cmd.type === 'HIGHLIGHT_CELL') {
        const {x, y} = cmd.pos;
        const mapTile = this.tileAt(x, y);
        mapTile.tile.setTint(SELECTED_TILE_TINT);
      } else if (cmd.type === 'CLOSE_ACTION_PANEL') {
        this.closeActionWindow();
      } else if (cmd.type === 'END_UNIT_TURN') {
        const aliveIds = this.getAliveUnitsFromForce(this.currentForce).map(
          (u) => u.id,
        );

        const defeatedForces = this.getDefeatedForces();

        console.log(`defeated::`,defeatedForces)

        if (defeatedForces.includes(PLAYER_FORCE)) {
          console.log(`player loses!`);
        } else if (defeatedForces.includes(CPU_FORCE)) {
          console.log(`player wins!`);
        } else if (S.equals(aliveIds)(this.movedUnits)) {
          console.log(`all units moved, finish turn`);
          this.endTurn();
        } else if (this.currentForce === CPU_FORCE) {
          console.log(`ai turn, proceed`);
          this.time.addEvent({
            delay: 500,
            callback: () => this.runAi(this.currentForce),
          });
        } else {
          console.log(`player turn!!`);
        }
      } else if (cmd.type === 'RUN_TURN') {
        this.runTurn();
      }
    });
  }

  updateState(state: MapState) {
    this.state = state;
  }

  create(data: MapCommands[]) {
    console.log(`CREATE COMMANDS:`, data);
    //@ts-ignore
    window.map = this

    this.mapContainer = this.add.container(0, 0);
    this.uiContainer = this.add.container(0, 0);
    this.actionWindowContainer = this.add.container(0, 0);

    this.signal(data);

    this.renderMap();
    this.renderUnits();
    this.renderUI();
  }

  // ------ Internals ----------------

  getContainers() {
    return {container: this.mapContainer, uiContainer: this.uiContainer};
  }

  tileAt(x: number, y: number) {
    const tile = this.tiles.find((t) => t.x === x && t.y === y);
    if (!tile) throw new Error(INVALID_STATE);
    return tile;
  }

  setValidMoves() {
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
    return getUnit(this.state)(id);
  }
  mapUnit = <A>(fn: (u: MapUnit) => A) => (id: string) =>
    S.map<MapUnit, A>((unit) => fn(unit))(this.getUnit(id));

  unitIO = (fn: (u: MapUnit) => void) => (id: string) => {
    S.map<MapUnit, void>((unit) => fn(unit))(this.getUnit(id));
  };
  charaIO = (fn: (u: Chara) => void) => (id: string) => {
    S.map<Chara, void>((unit) => fn(unit))(this.getChara(id));
  };

  getDefeatedForces(): string[] {
    return this.state.forces
      .map((f) => f.id)
      .reduce((xs, x) => {
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
    this.state.cells.forEach((arr, col) =>
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
    this.state.units
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

    chara.onClick((_: Chara) => {
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
      this.unitIO((e) => {
        this.tileAt(e.pos.x, e.pos.y).tile.setTint(ENEMY_IN_CELL_TINT);
      })(enemy);
    });
  }

  getChara(unitId: string) {
    return S.find<Chara>((c) => c.unit.id === unitId)(this.charas);
  }

  handleClickOnOwnUnit(unit: MapUnit) {
    if (this.movedUnits.includes(unit.id))
      this.signal([{type: 'CLEAR_TILES'}, {type: 'SHOW_UNIT_PANEL', unit}]);
    else
      this.signal([
        {type: 'CLEAR_TILES'},
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
          const isInRange = S.elem(enemyUnit.id)(
            S.map<EnemyInRange, string>((e) => e.enemy)(
              selectedUnit.enemiesInRange,
            ),
          );

          if (
            selectedUnit.force === PLAYER_FORCE &&
            isInRange &&
            !this.movedUnits.includes(selectedUnit.id)
          ) {
            this.showEnemyUnitMenu(enemyUnit, chara_, selectedUnit);
            this.signal([
              {type: 'CLEAR_TILES'},
              {type: 'SHOW_CLICKABLE_CELLS', unit: selectedUnit},
            ]);
          } else {
            this.signal([
              {type: 'CLEAR_TILES'},
              {type: 'SHOW_UNIT_PANEL', unit: enemyUnit},
            ]);
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
    this.closeActionWindow();

    this.actionWindow(chara.container?.x || 0, chara.container?.y || 0, [
      {
        title: 'Attack',
        action: () => {
          this.moveToEnemyUnit(unit, chara, selectedAlly);
        },
      },
      {
        title: 'View',
        action: () => {
          console.log(unit);
        },
      },
      {
        title: 'Cancel',
        action: () => {
          this.closeActionWindow();
        },
      },
    ]);
  }

  moveToEnemyUnit(enemyUnit: MapUnit, chara: Chara, selectedAlly: MapUnit) {
    const enemy = S.find<EnemyInRange>((e) => e.enemy === enemyUnit.id)(
      selectedAlly.enemiesInRange,
    );
    this.movedUnits.push(selectedAlly.id);
    if (S.isJust(enemy)) {
      const alliedChara = this.charas.find(
        (c) => c.unit.id === selectedAlly.id,
      );

      if (!alliedChara) return;
      const attack = () => {
        this.turnOff();

        const isPlayer = selectedAlly.force === PLAYER_FORCE;

        this.scene.transition({
          target: 'CombatScene',
          duration: 0,
          moveBelow: true,
          data: {
            top: isPlayer ? enemyUnit.id : selectedAlly.id,
            bottom: isPlayer ? selectedAlly.id : enemyUnit.id,
          },
        });
      };

      S.map((e: any) => {
        const target = e.steps;
        this.moveUnit(alliedChara, target, attack);

        // TODO: IO, move to API
        selectedAlly.pos = target.reverse()[0];
      })(enemy);
    } else {
      console.error(`This should be impossible, check logic`);
      this.showUnitPanel(enemyUnit);
    }
  }
  turnOff() {
    this.mapContainer.destroy();
    this.uiContainer.destroy();
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
      this.unitIO((unit) => {
        text(20, 610, squad.name, uiContainer, this);
        text(1000, 610, `${unit.range} cells`, uiContainer, this);
      })(this.selectedUnit);
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

    console.log(this.movedUnits);

    this.showTurnTitle(force);

    this.setValidMoves();

    if (force.id === CPU_FORCE) {
      this.runAiActions(force.id);
    }
  }

  getAliveUnitsFromForce(forceId: string) {
    return getUnitsFromForce(this.state)(forceId).filter(
      (u) => u.status === 'alive',
    );
  }
  runAi(forceId: string) {
    const remainingUnits = this.getAliveUnitsFromForce(forceId).filter(
      (u) => !this.movedUnits.includes(u.id),
    );

    if (remainingUnits.length < 1) return;

    const unit = remainingUnits[0];
    if (!unit) throw new Error(INVALID_STATE);

    this.selectedUnit = unit.id;
    this.renderUI();

    const maybeEnemiesInRange = S.head(unit.enemiesInRange);

    if (S.isJust(maybeEnemiesInRange)) {
      S.map<EnemyInRange, void>((eir) => {
        this.unitIO((enemy) => {
          const enemyChara = this.getChara(enemy.id);

          S.map<Chara, void>((chara) => {
            this.moveToEnemyUnit(enemy, chara, unit);
          })(enemyChara);
        })(eir.enemy);
      })(maybeEnemiesInRange);
    } else {
      const {x, y} = randomItem(unit.validSteps).target;

      const tile = this.getTileAt(x, y);

      this.moveToTile(unit.id, tile, () =>
        this.signal([{type: 'END_UNIT_TURN'}]),
      );
    }
  }
  runAiActions(forceId: string) {
    this.runAi(forceId);
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
    const {tile} = mapTile;

    this.signal([
      {type: 'CLOSE_ACTION_PANEL'},
      {type: 'SHOW_CLICKABLE_CELLS', unit},
      {type: 'HIGHLIGHT_CELL', pos: {x: mapTile.x, y: mapTile.y}},
    ]);

    this.actionWindow(tile.x, tile.y, [
      {
        title: 'Move',
        action: () => {
          //TODO: convert to data
          this.moveToTile(unit.id, mapTile, onMoveComplete);
          this.actionWindowContainer?.destroy();
          tile.clearTint();
        },
      },
      {
        title: 'Cancel',
        action: () => {
          this.signal([
            {type: 'CLOSE_ACTION_PANEL'},
            {type: 'SHOW_CLICKABLE_CELLS', unit},
          ]);
        },
      },
    ]);
  }

  actionWindow(
    x: number,
    y: number,
    actions: {title: string; action: () => void}[],
  ) {
    if (this.actionWindowContainer) this.actionWindowContainer.destroy();
    this.actionWindowContainer = this.add.container(x, y);
    const btns = actions.map(({title, action}, index) => {
      if (!this.actionWindowContainer) throw new Error(INVALID_STATE);
      return button(
        20,
        index * 50,
        title,
        this.actionWindowContainer,
        this,
        action,
      );
    });

    const largest = btns.sort((a, b) => b.displayWidth - a.displayWidth)[0]
      .displayWidth;
    btns.forEach((btn) => {
      btn.setDisplaySize(largest, btn.displayHeight);
    });
  }

  // TODO: simplify interface
  moveToTile(unitId: string, mapTile: MapTile, onMoveComplete: Function) {
    const {x, y} = mapTile;

    // Move unit to tile
    const chara = this.charas.find((c) => c.unit.id === unitId);
    const force = this.getCurrentForce();

    if (!chara || !force) throw new Error(INVALID_STATE);

    const squad = this.state.units.find((unit) => unit.id === chara.unit.squad);

    if (!squad) throw new Error(INVALID_STATE);

    this.tiles.forEach((tile) =>
      walkableTiles.includes(tile.type) ? tile.tile.clearTint() : null,
    );

    this.movedUnits.push(unitId);

    this.unitIO((unit) => {
      const maybePath = S.find((step: any) => S.equals(step.target)({x, y}))(
        unit.validSteps,
      );

      S.map((step: any) => {
        this.moveUnit(chara, step.steps, onMoveComplete);
      })(maybePath);
    })(unitId);

    this.signal([{type: 'UPDATE_UNIT_POS', id: squad.id, pos: {x, y}}]);

    this.renderUI();
  }
  endTurn() {
    this.movedUnits = [];
    this.charas.forEach((u) => u.container?.setAlpha(1));
    this.switchForce();
    this.runTurn();
  }

  // TODO: simplify interface (require only ids)
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
    return this.getEnemies().some(
      ({pos: {x, y}}) => x === tile.x && y === tile.y,
    );
  }

  getEnemies() {
    return this.state.units.filter((unit) => unit.force !== this.currentForce);
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
