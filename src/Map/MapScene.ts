import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {getSquads} from '../DB';
import {INVALID_STATE} from '../errors';
import button from '../UI/button';
import {Container, Image, Pointer} from '../Models';
import panel from '../UI/panel';
import {
  squadsFromForce as getSquadsFromForce,
  getSquad,
  getPathTo,
} from '../API/Map/api';
import {
  Vector,
  MapSquad,
  MapState,
  Force,
  ValidStep,
  City,
  PLAYER_FORCE,
  CPU_FORCE,
} from '../API/Map/Model';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from '../constants';
import {toMapSquad, Unit} from '../Unit/Model';
import {Map, Set} from 'immutable';
import {getCity} from '../API/Map/utils';
import victoryCondition from './effects/victoryCondition';
import speech from '../UI/speech';
import StaticBoardScene from '../Board/StaticBoardScene';
import clickCell from './board/clickCell';
import renderMap from './board/renderMap';
import renderSquads, {renderSquad} from './board/renderSquads';
import entityInfo from './entityInfo';
import squadDetails from './effects/squadDetails';
import {Squad} from '../Squad/Model';
import {makeVector, VectorRec} from './makeVector';
import annoucement from '../UI/annoucement';
import {delay, tween} from '../Scenes/utils';
import {fadeIn, fadeOut} from '../UI/Transition';

const WALKABLE_CELL_TINT = 0x88aa88;
const ENEMY_IN_CELL_TINT = 0xff2222;

const SPEED = 1;

const SQUAD_MOVE_DURATION = 200 / SPEED;
const CHARA_VERTICAL_OFFSET = -10;

const CITY_SCALE = 0.5;

export const cellSize = 100;

const boardPadding = 50;

const walkableTiles = [0];

const CITY_HEAL_PERCENT = 20;

export type MapTile = {
  x: number;
  y: number;
  type: number;
  tile: Image;
};

export type MapCommands =
  | {type: 'UPDATE_STATE'; target: MapState}
  | {type: 'UPDATE_SQUAD_POS'; id: string; pos: Vector}
  | {type: 'UPDATE_UNIT'; unit: Unit}
  | {
      type: 'DESTROY_TEAM';
      target: string;
    }
  | {
      type: 'CLICK_CELL';
      cell: MapTile;
    }
  | {
      type: 'CLICK_SQUAD';
      unit: MapSquad;
    }
  | {type: 'CLEAR_TILES'}
  | {type: 'MOVE_CAMERA_TO'; x: number; y: number; duration: number}
  | {type: 'CLEAR_TILES_EVENTS'}
  | {type: 'CLEAR_TILES_TINTING'}
  | {type: 'RESET_SQUAD_POSITION'; unit: MapSquad}
  | {type: 'SHOW_TARGETABLE_CELLS'; unit: MapSquad}
  | {type: 'HIGHLIGHT_CELL'; pos: Vector}
  | {type: 'CLOSE_ACTION_PANEL'}
  | {type: 'SELECT_CITY'; id: string}
  | {type: 'SET_SELECTED_UNIT'; id: string}
  | {type: 'VIEW_SQUAD_DETAILS'; id: string}
  | {type: 'END_SQUAD_TURN'; id: string}
  | {type: 'REFRESH_UI'}
  | {type: 'CITY_CLICK'; id: string}
  | {type: 'END_FORCE_TURN'; id: string}
  | {type: 'CAPTURE_CITY'; id: string; force: string}
  | {type: 'RUN_TURN'}
  | {type: 'MOVE_SQUAD'; mapTile: MapTile; squad: MapSquad};

type Mode =
  | {type: 'NOTHING_SELECTED'}
  | {type: 'SQUAD_SELECTED'; id: string}
  | {type: 'CITY_SELECTED'; id: string}
  | {type: 'MOVING_SQUAD'; start: Vector; id: string}
  | {type: 'SELECTING_ATTACK_TARGET'; id: string}
  | {type: 'CHANGING_SQUAD_FORMATION'};

const DEFAULT_MODE: Mode = {type: 'NOTHING_SELECTED'};

export class MapScene extends Phaser.Scene {
  charas: Chara[] = [];
  tiles: MapTile[] = [];
  moveableCells: Set<VectorRec> = Set();
  walkableGrid: number[][] = [[]];
  tileIndex: MapTile[][] = [[]];
  citySprites: Image[] = [];
  mode: Mode = DEFAULT_MODE;

  // Containers can't be created in the constructor, so we are casting the types here
  // TODO: consider receiving containers from parent or pass them around in functions
  mapContainer = {} as Container;
  missionContainer = {} as Container;
  uiContainer = {} as Container;

  actionWindowContainer: null | Container = null;
  state = {} as MapState;

  currentForce: string = PLAYER_FORCE;
  /** Units moved by a force in a given turn
   * Why can't I think on a better name for this?
   * */
  movedSquads: Set<string> = Set();

  dragState: null | Vector = null;

  mapX: number = 0;
  mapY: number = 0;
  isDragging = false;
  bounds = {
    x: {min: 0, max: 0},
    y: {min: 0, max: 0},
  };

  hasShownVictoryCondition = false;
  dragDisabled = false;
  cellClickDisabled = false;

  cellHighlight: Phaser.GameObjects.Rectangle | null = null;

  // ----- Phaser --------------------
  constructor() {
    super('MapScene');
  }

  signal(eventName: string, cmds: MapCommands[]) {
    console.log(`💁 ::: SIGNAL ::: ${eventName}`, cmds);
    cmds.forEach(async (cmd) => {
      console.time(cmd.type);
      if (cmd.type === 'DESTROY_TEAM') {
        this.destroySquad(cmd.target);
      } else if (cmd.type === 'UPDATE_STATE') {
        this.updateState(cmd.target);
      } else if (cmd.type === 'UPDATE_SQUAD_POS') {
        this.state.mapSquads = this.state.mapSquads.map((squad) =>
          squad.id === cmd.id ? {...squad, pos: cmd.pos} : squad,
        );
      } else if (cmd.type === 'UPDATE_UNIT') {
        this.state.units = this.state.units.set(cmd.unit.id, cmd.unit);
      } else if (cmd.type === 'CLICK_CELL') {
        if (this.cellClickDisabled) {
          console.log(`cell click disabled! cancelling`);
          return;
        }
        clickCell(this, cmd.cell);
      } else if (cmd.type === 'CLICK_SQUAD') {
        this.clickSquad(cmd.unit);
      } else if (cmd.type === 'MOVE_CAMERA_TO') {
        this.moveCameraTo({x: cmd.x, y: cmd.y}, cmd.duration);
      } else if (cmd.type === 'CLEAR_TILES') {
        this.clearTiles();
      } else if (cmd.type === 'CLEAR_TILES_EVENTS') {
        this.clearAllTileEvents();
      } else if (cmd.type === 'CLEAR_TILES_TINTING') {
        this.clearAllTileTint();
      } else if (cmd.type === 'SHOW_TARGETABLE_CELLS') {
        this.showClickableCellsForUnit(cmd.unit);
      } else if (cmd.type === 'HIGHLIGHT_CELL') {
        this.highlightCell(cmd);
      } else if (cmd.type === 'CLOSE_ACTION_PANEL') {
        this.closeActionWindow();
      } else if (cmd.type === 'VIEW_SQUAD_DETAILS') {
        this.viewSquadDetails(cmd.id);
      } else if (cmd.type === 'REFRESH_UI') {
        this.refreshUI();
      } else if (cmd.type === 'END_SQUAD_TURN') {
        this.endSquadTurn(cmd.id);
      } else if (cmd.type === 'RUN_TURN') {
        this.startForceTurn();
      } else if (cmd.type === 'CITY_CLICK') {
        this.selectCity(cmd.id);
      } else if (cmd.type === 'CAPTURE_CITY') {
        this.captureCity(cmd);
      } else if (cmd.type === 'END_FORCE_TURN') {
        this.switchForce();
      }

      console.timeEnd(cmd.type);
    });

    console.log(`🙅 ::: finish signal ${eventName}`);
  }

  private captureCity(cmd: {type: 'CAPTURE_CITY'; id: string; force: string}) {
    this.state.cities = this.state.cities.map((city) =>
      city.id === cmd.id ? {...city, force: cmd.force} : city,
    );
  }

  private async endSquadTurn(id: string) {
    this.movedSquads = this.movedSquads.add(id);

    const chara = await this.getChara(id);
    chara?.container.setAlpha(0.5);

    this.clearAllTileTint();
    this.changeMode({type: 'SQUAD_SELECTED', id});

    // const aliveIds = getSquadsFromForce(this.state)(this.currentForce).map(
    //   (u) => u.id,
    // );
    const defeatedForces = this.getDefeatedForces();

    if (defeatedForces.includes(PLAYER_FORCE)) {
      alert(`Player loses!`);
    } else if (defeatedForces.includes(CPU_FORCE)) {
      alert(`Player wins!`);
    }
    // else if (Set(aliveIds).equals(Set(this.movedSquads))) {
    //   this.endTurn();
    // }
    else if (this.currentForce === CPU_FORCE) {
      await delay(this, 500);
      this.runAi();
    } else {
      console.log(`=== PLAYER ===`);
    }
  }

  private async destroySquad(target: string) {
    // this.state.forces = this.state.forces.map((force) => ({
    //   ...force,
    //   squads: force.squads.filter((s) => s !== target),
    // }));

    await delay(this, 100);

    const chara = await this.getChara(target);

    const forceId = this.state.mapSquads.find((s) => s.id === target).force;

    const squadId = this.state.mapSquads.find((s) => s.id === target).id;

    chara.fadeOut(async () => {
      await delay(this, 100);

      this.state.forces = this.state.forces.map((force) => {
        if (force.id === forceId)
          return {...force, squads: force.squads.filter((id) => id !== target)};
        else return force;
      });

      this.movedSquads = this.movedSquads.filter((id) => id !== target);

      this.charas = this.charas.filter((c) => c.unit.squad.id !== target);

      this.state.mapSquads = this.state.mapSquads.filter(
        (s) => s.id !== target,
      );
      this.state.units = this.state.units.filter((u) => u.squad.id !== squadId);

      chara.container.destroy();
      this.scene.remove(chara.scene.key);
    });
  }

  private selectCity(id: string) {
    this.refreshUI();
    const {x, y} = this.cityIO(id);

    this.signal('selectCity', [{type: 'MOVE_CAMERA_TO', x, y, duration: 500}]);
  }

  private highlightCell(cmd: {type: 'HIGHLIGHT_CELL'; pos: Vector}) {
    const {x, y} = cmd.pos;
    const mapTile = this.tileAt(x, y);

    this.cellHighlight?.destroy();
    this.cellHighlight = this.add.rectangle(
      mapTile.tile.x,
      mapTile.tile.y,
      cellSize,
      cellSize,
    );

    this.cellHighlight.setStrokeStyle(8, 0x1a65ac);
    this.mapContainer.add(this.cellHighlight);
  }

  updateState(state: MapState) {
    this.state = state;
  }

  async create(data: MapCommands[]) {

    if (process.env.NODE_ENV !== 'production') {
      //@ts-ignore
      window.mapScene = this;
    }
    this.sound.stopAll();
    const music = this.sound.add('map1');

    //@ts-ignore
    music.setVolume(0.3);
    music.play();

    this.mapContainer = this.add.container(this.mapX, this.mapY);
    this.uiContainer = this.add.container();
    this.missionContainer = this.add.container();
    this.actionWindowContainer = this.add.container();

    this.signal('startup', data);

    renderMap(this);
    this.renderStructures();

    renderSquads(this);

    await fadeIn(this)

    this.refreshUI();

    this.makeWorldDraggable();
    this.setWorldBounds();



    this.startForceTurn();
    // if (!this.hasShownVictoryCondition) {
    //   this.showVictoryCondition();
    //   this.hasShownVictoryCondition = true;
    // }
  }

  showVictoryCondition() {
    victoryCondition(this);
  }

  /**
   * Moves camera position to a vector in the board. If the position is out of bounds, moves until the limit.
   */
  moveCameraTo(vec: Vector, duration: number) {
    let {x, y} = this.getPos(vec);

    x = x * -1 + SCREEN_WIDTH / 2;

    y = y * -1 + SCREEN_HEIGHT / 2;

    const tx = () => {
      if (x < this.bounds.x.min) return this.bounds.x.min;
      else if (x > this.bounds.x.max) return this.bounds.x.max;
      else return x;
    };
    const ty = () => {
      if (y < this.bounds.y.min) return this.bounds.y.min;
      else if (y > this.bounds.y.max) return this.bounds.y.max;
      else return y;
    };

    return new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.mapContainer,
        x: tx(),
        y: ty(),
        duration: duration,
        ease: 'cubic.out',
        onComplete: () => {
          resolve();
        },
      });

      this.tweens.add({
        targets: this,
        mapX: tx(),
        mapY: ty(),
        duration: duration,
        ease: 'cubic.out',
      });
    });
  }

  setWorldBounds() {
    const rows = this.state.cells[0].length;
    const cols = this.state.cells.length;
    this.bounds = {
      x: {min: -1 * (rows * cellSize - SCREEN_WIDTH), max: 0},
      y: {min: -1 * (cols * cellSize - SCREEN_HEIGHT), max: 0},
    };
  }
  label(x: number, y: number, text: string) {
    const container = this.add.container();
    const text_ = this.add.text(x, y, text, {
      fontSize: '36px',
      color: '#fff',
    });
    text_.setOrigin(0.5);
    panel(
      text_.x - 20 - text_.width / 2,
      text_.y - 20 - text_.height / 2,
      text_.width + 40,
      text_.height + 40,
      container,
      this,
    );

    container.add(text_);

    this.missionContainer.add(container);

    return container;
  }

  makeWorldDraggable() {
    this.mapContainer.setSize(
      this.mapContainer.getBounds().width,
      this.mapContainer.getBounds().height,
    );

    this.mapContainer.setInteractive();

    this.input.setDraggable(this.mapContainer);

    this.input.on(
      'drag',
      (_: Pointer, gameObject: Image, dragX: number, dragY: number) => {
        if (this.dragDisabled) return;

        if (!this.isDragging) this.isDragging = true;

        const dx = gameObject.x - dragX;
        const dy = gameObject.y - dragY;

        const mx = this.mapX - dx;
        const my = this.mapY - dy;

        const {x, y} = this.bounds;

        if (mx < x.max && mx > x.min && my < y.max && my > y.min)
          this.mapContainer.setPosition(this.mapX - dx, this.mapY - dy);
        else {
          // Movement bound to one or two corners
          const gx = mx > x.max ? x.max : mx < x.min ? x.min : this.mapX - dx;
          const gy = my > y.max ? y.max : my < y.min ? y.min : this.mapY - dy;

          this.mapContainer.setPosition(gx, gy);
        }
      },
    );

    this.input.on('dragend', async (pointer: Pointer) => {
      const timeDelta = pointer.upTime - pointer.downTime;
      const posDelta =
        Math.abs(pointer.upX - pointer.downX) +
        Math.abs(pointer.upY - pointer.downY);
      const minTimeDelta = 300;
      const minPosDelta = 30;

      this.mapX = this.mapContainer.x;
      this.mapY = this.mapContainer.y;
      // Avoid firing "click_cell" event on dragend

      if (
        this.isDragging &&
        timeDelta > minTimeDelta &&
        posDelta > minPosDelta
      ) {
        this.disableCellClick();
        await delay(this, 20);
        this.enableCellClick();
      }
      this.isDragging = false;
    });
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
  cityAt(x: number, y: number) {
    return this.state.cities.find((c) => c.x === x && c.y === y);
  }

  getForce(id: string) {
    const force = this.state.forces.find((force) => force.id === id);
    if (!force) throw new Error(INVALID_STATE);
    return force;
  }

  async forceIO(id: string) {
    return this.state.forces.find((f) => f.id === id);
  }

  getUnit(id: string): MapSquad {
    let u = getSquad(this.state)(id);

    if (!u) throw new Error(INVALID_STATE);
    return u;
  }

  squadIO = (id: string): MapSquad => {
    let sqd = this.state.mapSquads.find((s) => s.id === id);

    if (!sqd) throw new Error(INVALID_STATE);

    return sqd;
  };

  cityIO = (id: string): City => {
    const city = this.state.cities.find((c) => c.id === id);

    if (!city) throw new Error(INVALID_STATE);
    else return city;
  };

  getDefeatedForces(): string[] {
    return this.state.forces
      .map((f) => f.id)
      .reduce((xs, x) => {
        const allDefeated = this.state.mapSquads
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

  renderStructures() {
    this.state.cities.forEach((city) => {
      const {x, y} = this.getPos({x: city.x, y: city.y});

      const city_ = this.add.image(x, y, `tiles/${city.type}`);

      city_.setScale(CITY_SCALE);

      if (city.force === 'PLAYER_FORCE') {
        //city_.setTint(ALLIED_CITY_TINT);
      } else {
        //city_.setTint(ENEMY_CITY_TINT);
      }
      // city_.setInteractive();
      // city_.on('pointerup', () => {
      //     this.signal([{type: 'CITY_CLICK', id: city.id}]);
      // });
      this.mapContainer.add(city_);
      city_.name = city.id;
      this.citySprites.push(city_);
    });
  }

  // TODO: call this only once, and control on/off with boolean
  // as this takes 150ms to run
  makeCellsInteractive() {
    this.clearAllTileEvents();
    this.tiles.forEach((tile) => this.makeInteractive(tile));
  }
  getSelectedSquad() {
    if (
      this.mode.type === 'SQUAD_SELECTED' ||
      this.mode.type === 'MOVING_SQUAD' ||
      this.mode.type === 'SELECTING_ATTACK_TARGET'
    )
      return this.getUnit(this.mode.id);
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on('pointerup', async (pointer: Pointer) => {
      if (!this.cellClickDisabled)
        this.signal('regular click cell', [
          {type: 'CLICK_CELL', cell},
          {type: 'HIGHLIGHT_CELL', pos: cell},
        ]);

      var ping = this.add.circle(pointer.upX, pointer.upY, 20, 0xffff66);

      await tween(this, {
        targets: ping,
        alpha: 0,
        duration: 500,
        scale: 2,
        onComplete: () => {
          ping.destroy();
        },
      });
    });
  }
  clearAllTileEvents() {
    this.tiles.forEach((tile) => {
      tile.tile.removeAllListeners();
    });
  }
  clearAllTileTint() {
    this.tiles.forEach((tile) => {
      tile.tile.clearTint();
      this.tweens.killTweensOf(tile.tile);
      tile.tile.alpha = 1;
    });
  }

  getCellPositionOnScreen({x, y}: {x: number; y: number}) {
    const pos = this.getPos({x, y});

    return {...pos, y: pos.y + CHARA_VERTICAL_OFFSET};
  }

  async clickSquad(squad: MapSquad) {
    await this.moveCameraTo(squad.pos, 100);

    this.signal('clicked on unit, marking cell as selected', [
      {type: 'HIGHLIGHT_CELL', pos: squad.pos},
    ]);
    if (squad.force === PLAYER_FORCE) {
      this.handleClickOnOwnUnit();
    } else {
      this.handleClickOnEnemyUnit(squad);
    }
  }

  showClickableCellsForUnit(squad: MapSquad) {
    this.clearTiles();

    const dirs = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ];

    const enemies = Set(
      this.getEnemies()
        .map((e) => e.pos)
        .map(makeVector),
    );

    let cells: Set<VectorRec> = Set();

    const getCells = ({x, y}: {x: number; y: number}, distance: number) =>
      dirs.forEach(([xx, yy]) => {
        const vector = makeVector({x: xx + x, y: yy + y});

        if (
          vector.x < 0 ||
          vector.y < 0 ||
          this.tileAt(vector.x, vector.y).type !== 0 ||
          enemies.has(vector)
        )
          return;
        cells = cells.add(vector);

        if (distance > 0) getCells(vector, distance - 1);
      });

    getCells(squad.pos, 2);

    this.moveableCells = cells;

    this.moveableCells.toJS().forEach((cell) => {
      const tile = this.tileAt(cell.x, cell.y);

      this.tintClickableCells(tile);
    });

    this.walkableGrid = this.makeWalkableGrid(this.moveableCells);
    //this.highlightAttackableCells(squad);
  }

  highlightAttackableCells(mapSquad: MapSquad) {
    this.getTargets(mapSquad.pos).forEach((e) => {
      const tile = this.tileAt(e.pos.x, e.pos.y).tile;
      tile.setTint(ENEMY_IN_CELL_TINT);
      this.tweens.add({
        targets: tile,
        alpha: 0.2,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  async getChara(squadId: string) {
    return this.charas.find((c) => c.key === this.charaKey(squadId));
  }

  charaKey(squadId: string) {
    return `unit-${squadId}`;
  }

  handleClickOnOwnUnit() {
    this.refreshUI();
  }

  async handleClickOnEnemyUnit(enemyUnit: MapSquad) {
    switch (this.mode.type) {
      case 'SELECTING_ATTACK_TARGET':
        const selectedUnit = this.getSquad(this.mode.id);
        if (this.getDistance(selectedUnit.pos, enemyUnit.pos) === 1) {
          this.attackEnemySquad(selectedUnit, enemyUnit);
        }
        break;
      default:
        this.changeMode({type: 'SQUAD_SELECTED', id: enemyUnit.id});
    }
  }

  attack = async (starter: MapSquad, target: MapSquad) => {

    await fadeOut(this);

    this.turnOff();

    const isPlayer = starter.force === PLAYER_FORCE;

    const combatCallback = (cmds: MapCommands[]) => {
      let squads = cmds.reduce((xs, x) => {
        if (x.type === 'UPDATE_UNIT') {
          let sqdId = x.unit.squad?.id || '';

          if (!xs[sqdId]) {
            xs[sqdId] = [];
          }

          xs[sqdId].push(x.unit.currentHp);
        }

        return xs;
      }, {} as {[x: string]: number[]});

      let defeated = Map(squads)
        .filter((v) => v.every((n) => n === 0))
        .keySeq()
        .map((target) => ({type: 'DESTROY_TEAM', target}))
        .toJS();

      this.scene.start(
        'MapScene',
        cmds
          .concat(defeated)
          .concat([{type: 'END_SQUAD_TURN', id: starter.id}]),
      );
    };


    this.scene.start('CombatScene', {
      squads: this.state.mapSquads,
      units: this.state.units.map((u) =>
        // make player units overpowered
        u.id.startsWith('player')
          ? {...u, str: 999, dex: 999, hp: 999, currentHp: 999}
          : u,
      ),
      top: isPlayer ? target.id : starter.id,
      bottom: isPlayer ? starter.id : target.id,
      onCombatFinish: combatCallback,
    });
  };

  turnOff() {
    this.mapContainer.destroy();
    this.uiContainer.destroy();
    this.charas.forEach((chara) => {
      chara.container.destroy();
      this.scene.remove(chara);
    });
    this.charas = [];
    this.tiles.forEach((tile) => {
      tile.tile.destroy();
    });
    this.tiles = [];
    this.tileIndex = [[]];
    this.mode = DEFAULT_MODE;
  }

  tintClickableCells(cell: MapTile) {
    cell.tile.setTint(WALKABLE_CELL_TINT);
  }

  async destroyUI() {
    const {uiContainer} = this.getContainers();

    uiContainer.removeAll(true);
  }

  async refreshUI() {
    this.destroyUI();

    if (
      this.mode.type === 'NOTHING_SELECTED' ||
      this.mode.type === 'CHANGING_SQUAD_FORMATION'
    )
      return;

    const {uiContainer} = this.getContainers();

    entityInfo(this, uiContainer);

    this.returnToTitleButton();
  }

  viewSquadDetails(id: string): void {
    const squad = this.getSquad(id);
    this.disableMapInput();
    squadDetails(
      this,
      squad,
      this.state.units
        .toList()
        .filter((u) => Object.keys(squad.members).includes(u.id))
        .toJS(),
      () => this.enableInput(),
    );
  }

  private returnToTitleButton() {
    button(1100, 50, 'Return to Title', this.uiContainer, this, () => {
      this.turnOff();
      this.scene.start('TitleScene');
    });
  }

  renderDispatchWindow() {
    let container = this.add.container();
    panel(100, 100, 500, 500, container, this);

    let x = 120;
    let y = 120;

    button(500, 120, 'Close', container, this, () => {
      container.destroy();
      this.enableInput();
    });

    let currentSquads = Set(this.getPlayerSquads().map((s) => s.id));

    // TODO: avoid listing defeated squads
    let squadsToRender = Object.values(getSquads()).filter(
      (sqd) => !currentSquads.has(sqd.id),
    );

    squadsToRender.forEach((sqd, i) => {
      button(x, y + 70 * i, sqd.name, container, this, async () => {
        this.dispatchSquad(sqd);
        container.destroy();
        this.enableInput();

        await delay(this, 100);

        this.changeMode({type: 'SQUAD_SELECTED', id: sqd.id});

        let squad = this.squadIO(sqd.id);
        this.signal('clicked dispatch squad button', [
          {type: 'CLICK_SQUAD', unit: squad},
          {
            type: 'MOVE_CAMERA_TO',
            x: squad.pos.x,
            y: squad.pos.y,
            duration: 500,
          },
        ]);
      });
    });
  }

  getSquad(squadId: string) {
    let squad = this.state.mapSquads.find((s) => s.id === squadId);

    if (!squad) throw new Error(INVALID_STATE);
    return squad;
  }
  getSelectedSquadLeader(squadId: string) {
    let squad = this.getSquad(squadId);

    let leader = Object.values(squad.members).find((u) => u.leader);

    let unit = this.state.units.get(leader.id);

    if (!unit) throw new Error(INVALID_STATE);
    return unit;
  }

  getPlayerSquads() {
    return this.state.mapSquads.filter((sqd) => sqd.force === PLAYER_FORCE);
  }

  async dispatchSquad(squad: Squad) {
    const force = await this.forceIO(PLAYER_FORCE);
    let mapSquad = toMapSquad(
      squad,
      getCity(force.initialPosition, this.state),
    );

    this.state.mapSquads.push(mapSquad);
    force.squads.push(squad.id);

    renderSquad(this, mapSquad);
  }

  disableCellClick() {
    this.cellClickDisabled = true;
  }

  enableCellClick() {
    this.cellClickDisabled = false;
  }

  async switchForce() {
    const force = this.state?.forces.find(
      (force) => force.id !== this.currentForce,
    );
    if (!force) throw new Error(INVALID_STATE);
    this.currentForce = force.id;
    this.charas.forEach((c) => (c.container.alpha = 1));
    this.movedSquads = Set();

    await this.showTurnTitle(force);
    this.startForceTurn();
  }

  async startForceTurn() {
    const force = this.getForce(this.currentForce);


    this.healUnits(force);

    if (force.id === CPU_FORCE) {
      this.disableMapInput();
      await delay(this, 300);
      this.runAi();
    } else {
      this.enableInput();
      const unit = this.state.mapSquads.filter(
        (u) => u.force === PLAYER_FORCE,
      )[0];
      this.clickSquad(unit);

      const squad = this.getPlayerSquads()[0];
      this.changeMode({type: 'SQUAD_SELECTED', id: squad.id});
    }
  }

  healUnits(force: Force) {
    this.getAliveSquadsFromForce(force.id).forEach((s) => {
      if (this.state.cities.find((c) => c.x === s.pos.x && c.y === s.pos.y)) {
        this.healSquad(s);
      }
    });
  }

  healSquad(squad: MapSquad) {
    Object.keys(squad.members).forEach((unitId) => {
      const unit = this.state.units.get(unitId);

      if (unit && unit.currentHp > 0 && unit.currentHp < unit.hp) {
        const healAmount = Math.floor((unit.hp / 100) * CITY_HEAL_PERCENT);

        const newHp = unit.currentHp + healAmount;

        if (newHp < unit.hp)
          this.state.units = this.state.units.set(unitId, {
            ...unit,
            currentHp: newHp,
          });
      }
    });
  }

  getAliveSquadsFromForce(forceId: string) {
    return getSquadsFromForce(this.state)(forceId).filter(
      (u) => u.status === 'alive',
    );
  }
  /**
   * @TODO: refactor to make this return a list of ai actions
   * its hard to debug by going into other methods
   */
  async runAi() {
    const remainingUnits = this.getAliveSquadsFromForce(CPU_FORCE).filter(
      (u) => !this.movedSquads.includes(u.id),
    );

    const [currentSquad] = remainingUnits;
    if (!currentSquad) {
      return this.switchForce();
    }

    let aiMode = this.state.ai.get(currentSquad.id);

    if (aiMode === 'DEFEND') {
      this.movedSquads = this.movedSquads.add(currentSquad.id);

      this.signal('finish ai squad turn (defend)', [
        {type: 'END_SQUAD_TURN', id: currentSquad.id},
      ]);
      return;
    }

    this.moveCameraTo(currentSquad.pos, 500);
    this.refreshUI();

    const enemyInRange = currentSquad.enemiesInRange[0];

    if (enemyInRange) {
      //const enemySquad = this.squadIO(enemyInRange.enemy);
      //this.moveToEnemyUnit(enemySquad, currentSquad);
    } else {
      const {x, y} = (currentSquad.validSteps.first() as ValidStep).steps[1];

      const tile = this.getTileAt(x, y);

      await this.moveToTile(currentSquad.id, tile);
      this.signal('finish ai turn, no enemy in range', [
        {type: 'END_SQUAD_TURN', id: currentSquad.id},
      ]);
    }
  }

  checkTurnEnd() {
    const force = this.getCurrentForce();

    const aliveUnits = this.getAliveSquadsFromForce(force.id);

    //this.getValidMoves();

    if (this.movedSquads.size === aliveUnits.length) this.endTurn();
  }

  async showTurnTitle(force: Force) {
    const forceName = force.id === PLAYER_FORCE ? 'Player' : 'Enemy';
    const message = `${forceName} Turn`;

    return await annoucement(this, message);
  }

  tilesInRange(x: number, y: number, range: number) {
    return this.tiles.filter((tile) => this.getDistance({x, y}, tile) <= range);
  }

  getDistance(source: Vector, target: Vector) {
    return Math.abs(target.x - source.x) + Math.abs(target.y - source.y);
  }

  clearTiles() {
    this.clearAllTileTint();

    //if (this.cellHighlight) this.cellHighlight.destroy();
    //  this.clearAllTileEvents();
  }

  closeActionWindow() {
    if (this.actionWindowContainer) {
      this.actionWindowContainer.destroy();
      this.enableInput();
    }
  }

  showCityInfo(id: string) {
    this.state.cities.find((c) => c.id === id);

    const pic = this.add.sprite(SCREEN_WIDTH / 2, 350, 'merano');
    pic.setOrigin(0.5);
    pic.setDisplaySize(250, 250);
    this.label(SCREEN_WIDTH / 2, 520, 'Merano Castle');
  }

  // TODO: simplify interface
  // wtf: moveToTile and moveunit???
  async moveToTile(squadId: string, mapTile: MapTile): Promise<void> {
    return new Promise(async (resolve) => {
      const {x, y} = mapTile;

      // Move unit to tile
      const chara = this.charas.find((c) => c.key === this.charaKey(squadId));
      const force = this.getCurrentForce();

      if (!chara || !force) throw new Error(INVALID_STATE);

      this.tiles.forEach((tile) =>
        walkableTiles.includes(tile.type) ? tile.tile.clearTint() : null,
      );

      this.clearTiles();

      this.movedSquads = this.movedSquads.add(squadId);

      const mapSquad = this.squadIO(squadId);
      const step = mapSquad.validSteps.find((step) =>
        Map(step.target).equals(Map({x, y})),
      );

      if (!step) throw new Error(INVALID_STATE);

      await this.moveUnit(squadId, step.steps);

      const city = this.cityAt(x, y);
      if (city && city.force !== mapSquad.force)
        this.signal('unit moved to enemy city, capturing', [
          {type: 'CAPTURE_CITY', id: city.id, force: mapSquad.force},
        ]);

      this.signal('unit moved, update position', [
        {type: 'UPDATE_SQUAD_POS', id: squadId, pos: {x, y}},
      ]);

      this.refreshUI();

      //TODO: having onMoveComplete/resolve AND this firing signals makes no sense
      resolve();
    });
  }
  endTurn() {
    setTimeout(() => {
      this.refreshUI();
    }, 50);
    this.clearTiles();
    this.movedSquads = Set();
    this.charas.forEach((u) => u.container?.setAlpha(1)); // TODO: name this "restore"

    this.switchForce();
  }

  selectNextAlly() {
    const squad = this.getPlayerSquads().find(
      (sqd) => !this.movedSquads.has(sqd.id),
    );

    if (squad) {
      this.signal('clicked next ally btn, selecting', [
        {type: 'CLICK_SQUAD', unit: squad},
      ]);
    }
  }

  /**
   * Moves a squad alongside a path
   */
  async moveUnit(squadId: string, path: Vector[]) {
    const chara = await this.getChara(squadId);

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
      });

    if (tweens.length > 0)
      return new Promise<void>((resolve) => {
        this.tweens.timeline({
          tweens,
          onComplete: () => {
            resolve();
          },
        });
      });
    else return Promise.resolve();
  }

  isEnemyInTile(tile: Vector) {
    return this.getEnemies().some(
      ({pos: {x, y}}) => x === tile.x && y === tile.y,
    );
  }

  getEnemies() {
    return this.state.mapSquads.filter(
      (unit) => unit.force !== this.currentForce,
    );
  }

  getTileAt(x: number, y: number) {
    const tile = this.tileIndex[y][x];

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }

  getTargets = (cell: Vector): MapSquad[] => {
    const enemies = this.getEnemies();

    const coords = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    return coords.reduce((xs, [x, y]) => {
      const target = enemies.find(
        (e) => e.pos.x + x === cell.x && e.pos.y + y === cell.y,
      );

      if (target) return xs.concat([target]);
      else return xs;
    }, [] as MapSquad[]);
  };

  async attackEnemySquad(playerSquad: MapSquad, enemySquad: MapSquad) {
    const baseX = 200;
    const baseY = 200;
    const scale = 0.5;

    this.disableMapInput();
    this.destroyUI();
    this.closeActionWindow();

    this.movedSquads = this.movedSquads.add(playerSquad.id);

    const bg = panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, this.uiContainer, this);
    bg.setAlpha(0.4);

    const leader = this.getSelectedSquadLeader(playerSquad.id);

    const enemyUnits = this.state.units
      .filter((u) => u.squad?.id === enemySquad.id)
      .toList()
      .toJS();

    const enemy = new StaticBoardScene(
      enemySquad,
      enemyUnits,
      baseX + 10,
      baseY + 5,
      scale,
      true,
    );

    this.scene.add('enemy_board', enemy, true);

    const alliedUnits = this.state.units
      .filter((u) => u.squad?.id === playerSquad.id)
      .toList()
      .toJS();

    const ally = new StaticBoardScene(
      playerSquad,
      alliedUnits,
      baseX + 200,
      baseY + 100,
      scale,
      false,
    );

    this.scene.add('ally_board', ally, true);

    const {portrait} = speech(
      leader,
      450,
      70,
      'Ready for Combat',
      this.uiContainer,
      this,
    );

    await delay(this, 3000);

    this.scene.remove(portrait.scene.key);

    ally.destroy(this);
    enemy.destroy(this);

    this.attack(playerSquad, enemySquad);
  }

  disableMapInput() {
    this.clearAllTileEvents();
    this.disableCellClick();
    this.dragDisabled = true;
  }

  enableInput() {
    this.dragDisabled = false;
    this.enableCellClick();
    this.makeCellsInteractive();
    this.refreshUI();
  }

  makeWalkableGrid(cells: Set<VectorRec>): number[][] {
    let grid = this.state.cells.map((c) => c.map(() => 1));

    return cells.toJS().reduce((grid_, {x, y}) => {
      grid_[y][x] = 0;

      return grid_;
    }, grid);
  }

  async moveSquadTo(id: string, target: Vector) {
    const source = this.getSquad(id);

    const path = getPathTo(this.walkableGrid)(source.pos)(
      target,
    ).map(([x, y]) => ({x, y}));

    await this.moveUnit(id, path);
  }

  showMoveControls(squad: MapSquad) {
    this.changeMode({type: 'MOVING_SQUAD', start: squad.pos, id: squad.id});
    this.signal('clicked on "show move controls" button', [
      {type: 'SHOW_TARGETABLE_CELLS', unit: squad},
    ]);
  }
  showAttackControls(squad: MapSquad) {
    this.changeMode({type: 'SELECTING_ATTACK_TARGET', id: squad.id});
    this.highlightAttackableCells(squad);
  }
  changeMode(mode: Mode) {
    console.log('CHANGING MODE', mode);
    this.mode = mode;
    this.refreshUI();
  }

  squadAt(x: number, y: number) {
    return this.state.mapSquads.find((s) => s.pos.x === x && s.pos.y === y);
  }
}
