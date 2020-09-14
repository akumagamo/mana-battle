import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {saveUnit} from '../DB';
import {INVALID_STATE} from '../errors';
import button from '../UI/button';
import {Container, Image, Pointer} from '../Models';
import panel from '../UI/panel';
import text from '../UI/text';
import {
  getPossibleMoves,
  unitsFromForce as getUnitsFromForce,
  getUnit,
} from '../API/Map/api';
import {
  Vector,
  MapSquad,
  MapState,
  Force,
  ValidStep,
  EnemyInRange,
  City,
  PLAYER_FORCE,
  CPU_FORCE,
  translateTiles,
  tileMap,
} from '../API/Map/Model';
import {randomItem} from '../defaultData';
import S from 'sanctuary';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from '../constants';
import BoardScene from '../Board/StaticBoardScene';
import {toMapSquad, Unit} from '../Unit/Model';
import {Map} from 'immutable';
import {getCity} from '../API/Map/utils';
const WALKABLE_CELL_TINT = 0x88aa88;
const ENEMY_IN_CELL_TINT = 0xff2222;
const SELECTED_TILE_TINT = 0x9955aa;

const SPEED = 4;

const SQUAD_MOVE_DURATION = 500 / SPEED;
const CHARA_MAP_SCALE = 0.45;
const CHARA_VERTICAL_OFFSET = -10;

const CITY_SCALE = 0.5;

const BOTTOM_PANEL_X = 0;
const BOTTOM_PANEL_Y = 600;
const BOTTOM_PANEL_WIDTH = 1280;
const BOTTOM_PANEL_HEIGHT = 120;

const ALLIED_CITY_TINT = 0x66ff66;
const ENEMY_CITY_TINT = 0xff6666;

const cellSize = 100;

const boardPadding = 50;

const walkableTiles = [0];

type MapTile = {
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
      type: 'CLICK_MAP_SQUAD';
      unit: MapSquad;
    }
  | {type: 'CLEAR_TILES'}
  | {type: 'MOVE_CAMERA_TO'; x: number; y: number; duration: number}
  | {type: 'CLEAR_TILES_EVENTS'}
  | {type: 'CLEAR_TILES_TINTING'}
  | {type: 'SHOW_SQUAD_PANEL'; unit: MapSquad}
  | {type: 'SHOW_CLICKABLE_CELLS'; unit: MapSquad}
  | {type: 'HIGHLIGHT_CELL'; pos: Vector}
  | {type: 'CLOSE_ACTION_PANEL'}
  | {type: 'SELECT_CITY'; id: string}
  | {type: 'END_SQUAD_TURN'}
  | {type: 'CITY_CLICK'; id: string}
  | {type: 'CAPTURE_CITY'; id: string; force: string}
  | {type: 'RUN_TURN'};

export class MapScene extends Phaser.Scene {
  charas: Chara[] = [];
  tiles: MapTile[] = [];
  citySprites: Image[] = [];

  // Containers can't be created in the constructor, so we are casting the types here
  // TODO: consider receiving containers from parent or pass them around in functions
  mapContainer = {} as Container;
  missionContainer = {} as Container;
  uiContainer = {} as Container;

  actionWindowContainer: null | Container = null;
  state = {} as MapState;

  selectedEntity: null | {type: 'city' | 'unit'; id: string} = null;

  currentForce: string = PLAYER_FORCE;
  /** Units moved by a force in a given turn */
  movedUnits: string[] = [];

  dragState: null | Vector = null;

  mapX: number = 0;
  mapY: number = 0;
  bounds = {
    x: {min: 0, max: 0},
    y: {min: 0, max: 0},
  };

  hasShownVictoryCondition = false;
  dragDisabled = false;
  cellClickDisabled = false;
  cityClickDisabled = false;

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
            chara.fadeOut(() => {});
          })(cmd.target);
        this.time.addEvent({
          delay: 100,
          callback: () => animation(),
        });
      } else if (cmd.type === 'UPDATE_STATE') {
        this.updateState(cmd.target);
      } else if (cmd.type === 'UPDATE_SQUAD_POS') {
        this.state.squads = this.state.squads.map((unit) =>
          unit.id === cmd.id ? {...unit, pos: cmd.pos} : unit,
        );
      } else if (cmd.type === 'UPDATE_UNIT') {
        saveUnit(cmd.unit);
      } else if (cmd.type === 'CLICK_CELL') {
        S.map<MapSquad, void>((unit) => {
          this.showCellMenu(unit, cmd.cell, () => this.checkTurnEnd()); // TODO: remove this callback
        })(this.getSelectedUnit());
      } else if (cmd.type === 'CLICK_MAP_SQUAD') {
        this.clickUnit(cmd.unit);
      } else if (cmd.type === 'MOVE_CAMERA_TO') {
        this.moveCameraTo({x: cmd.x, y: cmd.y}, cmd.duration);
      } else if (cmd.type === 'SELECT_CITY') {
        this.signal([{type: 'CLOSE_ACTION_PANEL'}, {type: 'CLEAR_TILES'}]);
        this.setSelectedCity(cmd.id);
        this.cityIO((c) => {
          this.signal([
            {type: 'MOVE_CAMERA_TO', x: c.x, y: c.y, duration: 500},
          ]);
        })(cmd.id);
      } else if (cmd.type === 'CLEAR_TILES') {
        this.clearTiles();
      } else if (cmd.type === 'CLEAR_TILES_EVENTS') {
        this.clearAllTileEvents();
      } else if (cmd.type === 'CLEAR_TILES_TINTING') {
        this.clearAllTileTint();
      } else if (cmd.type === 'SHOW_SQUAD_PANEL') {
        this.showUnitPanel(cmd.unit);
      } else if (cmd.type === 'SHOW_CLICKABLE_CELLS') {
        this.showClickableCellsForUnit(cmd.unit);
      } else if (cmd.type === 'HIGHLIGHT_CELL') {
        const {x, y} = cmd.pos;
        const mapTile = this.tileAt(x, y);
        mapTile.tile.setTint(SELECTED_TILE_TINT);
      } else if (cmd.type === 'CLOSE_ACTION_PANEL') {
        this.closeActionWindow();
      } else if (cmd.type === 'END_SQUAD_TURN') {
        const aliveIds = this.getAliveUnitsFromForce(this.currentForce).map(
          (u) => u.id,
        );

        const defeatedForces = this.getDefeatedForces();

        console.log(`defeated::`, defeatedForces);

        if (defeatedForces.includes(PLAYER_FORCE)) {
          console.log(`player loses!`);
        } else if (defeatedForces.includes(CPU_FORCE)) {
          console.log(`player wins!`);
        } else if (S.equals(aliveIds)(this.movedUnits)) {
          console.log(`all units moved, finish turn`);
          // TODO: move this to own event
          this.endTurn();
        } else if (this.currentForce === CPU_FORCE) {
          console.log(`ai turn, proceed`);
          this.time.addEvent({
            delay: 500,
            callback: () => this.runAi(),
          });
        } else {
          console.log(`player turn!!`);
        }
      } else if (cmd.type === 'RUN_TURN') {
        this.runTurn();
      } else if (cmd.type === 'CITY_CLICK') {
        if (this.selectedEntity && this.selectedEntity.type === 'unit')
          this.cityIO((city) => {
            this.unitIO((unit) => {
              if (unit.force === 'PLAYER_FORCE') {
                this.showCellMenu(unit, city, () => this.checkTurnEnd());
              }
            })((this.selectedEntity as any).id);
          })(cmd.id);
        else {
          this.signal([{type: 'SELECT_CITY', id: cmd.id}]);
        }

        this.refreshUI();
      } else if (cmd.type === 'CAPTURE_CITY') {
        this.state.cities = this.state.cities.map((city) =>
          city.id === cmd.id ? {...city, force: cmd.force} : city,
        );
        this.citySpriteIO((sprite) => sprite.setTint(ALLIED_CITY_TINT))(cmd.id);
      }
    });
  }

  updateState(state: MapState) {
    this.state = state;
  }

  create(data: MapCommands[]) {
    console.log(`CREATE COMMANDS:`, data);
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

    this.signal(data);

    this.renderMap();
    this.renderStructures();

    this.setValidMoves();
    this.renderSquads();
    this.refreshUI();

    this.setWorldBounds();
    this.makeWorldDraggable();

    this.runTurn();
    // if (!this.hasShownVictoryCondition) {
    //   this.showVictoryCondition();
    //   this.hasShownVictoryCondition = true;
    // }
  }

  tween(options: any) {
    return new Promise((resolve: any) =>
      this.tweens.add({
        ...options,
        onComplete: resolve,
      }),
    );
  }
  delay(delay: number) {
    return new Promise((resolve: any) =>
      this.time.addEvent({
        delay,
        callback: resolve,
      }),
    );
  }

  showVictoryCondition() {
    const title = this.label(SCREEN_WIDTH / 2, 60, 'Victory Condition');

    title.setAlpha(0);

    S.pipe([
      S.prop('cities'),
      S.find<City>((c) => c.type === 'castle' && c.force === CPU_FORCE),
      S.map<City, void>((c) => {
        this.delay(500)
          .then(() =>
            this.tween({
              targets: title,
              alpha: 1,
              duration: 1000,
            }),
          )
          .then(() => this.delay(500))
          .then(() => this.moveCameraTo(c, 1000))
          .then(() => {
            const conquer = this.label(
              SCREEN_WIDTH / 2,
              160,
              'Conquer enemy headquarters',
            );

            conquer.setAlpha(0);
            return this.tween({
              targets: conquer,
              alpha: 1,
              duration: 500,
            });
          })
          .then(() => {
            const pic = this.add.sprite(SCREEN_WIDTH / 2, 350, 'merano');
            pic.setOrigin(0.5);
            pic.setDisplaySize(250, 250);
            const name = this.label(SCREEN_WIDTH / 2, 520, 'Merano Castle');

            pic.setAlpha(0);
            name.setAlpha(0);

            this.missionContainer.add(pic);

            return this.tween({
              targets: [pic, name],
              alpha: 1,
              duration: 1000,
            });
          })
          .then(() => this.delay(1000))
          .then(() => {
            return this.tween({
              targets: this.missionContainer,
              alpha: 0,
              duration: 1000,
            });
          })
          .then(() => {
            this.missionContainer.destroy();
            this.missionContainer = this.add.container();
            const start = this.label(
              SCREEN_WIDTH / 2,
              SCREEN_HEIGHT / 2,
              'Mission Start',
            );
            start.setAlpha(0);
            return this.tween({
              targets: start,
              alpha: 1,
              duration: 1000,
            });
          })
          .then(() => this.delay(1000))
          .then(() =>
            this.tween({
              targets: this.missionContainer,
              alpha: 0,
              duration: 1000,
            }),
          )
          .then(() => this.runTurn());
      }),
    ])(this.state);
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

    return new Promise((resolve: any) =>
      this.tweens.add({
        targets: this.mapContainer,
        x: tx(),
        y: ty(),
        duration: duration,
        ease: 'cubic.out',
        onComplete: () => {
          this.mapX = tx();
          this.mapY = ty();

          resolve();
        },
      }),
    );
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
      color: '#000',
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

    this.input.on('dragend', () => {
      this.mapX = this.mapContainer.x;
      this.mapY = this.mapContainer.y;
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
    return S.find<City>((c) => c.x === x && c.y === y)(this.state.cities);
  }

  setValidMoves() {
    console.log(`SET VALID MOVES`);
    const moveList = getPossibleMoves(
      formatDataForApi(this.state)(this.currentForce),
    );

    const units = getUnitsFromForce(this.state)(this.currentForce);

    units.forEach((unit_) => {
      const resultUnit = S.chain(
        S.find((unit: MapSquad) => unit.id === unit_.id),
      )(moveList);

      const moves = S.map<MapSquad, ValidStep[]>((u) => u.validSteps)(
        resultUnit,
      );
      const enemies = S.map<MapSquad, EnemyInRange[]>((u) => u.enemiesInRange)(
        resultUnit,
      );

      S.map<ValidStep[], void>((steps) => {
        unit_.validSteps = steps;
      })(moves);
      S.map<EnemyInRange[], void>((e) => {
        unit_.enemiesInRange = e;
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
  mapUnit = <A>(fn: (u: MapSquad) => A) => (id: string) =>
    S.map<MapSquad, A>((unit) => fn(unit))(this.getUnit(id));

  unitIO = (fn: (u: MapSquad) => void) => (id: string) => {
    S.map<MapSquad, void>((unit) => fn(unit))(this.getUnit(id));
  };

  cityIO = (fn: (u: City) => void) => (id: string) => {
    S.map<City, void>((unit) => fn(unit))(
      S.find<City>((c) => c.id === id)(this.state.cities),
    );
  };

  citySpriteIO = (fn: (u: Image) => void) => (id: string) => {
    S.map<Image, void>((unit) => fn(unit))(
      S.find<Image>((c) => c.name === id)(this.citySprites),
    );
  };

  charaIO = (fn: (u: Chara) => void) => (id: string) => {
    S.map<Chara, void>((unit) => fn(unit))(this.getChara(id));
  };

  getDefeatedForces(): string[] {
    return this.state.forces
      .map((f) => f.id)
      .reduce((xs, x) => {
        const allDefeated = this.state.squads
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
      city_.setInteractive();
      city_.on('pointerup', () => {
        if (!this.cityClickDisabled)
          this.signal([{type: 'CITY_CLICK', id: city.id}]);
      });
      this.mapContainer.add(city_);
      city_.name = city.id;
      this.citySprites.push(city_);
    });
  }
  renderMap() {
    const {container} = this.getContainers();
    translateTiles(this.state.cells).forEach((arr, col) =>
      arr.forEach((n, row) => {
        const {x, y} = this.getPos({x: row, y: col});

        const tile = this.add.image(x, y, `tiles/${tileMap[n]}`);

        tile.setInteractive();

        container.add(tile);

        this.input.setDraggable(tile);

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
    if (this.selectedEntity && this.selectedEntity.type === 'unit') {
      return this.getUnit(this.selectedEntity.id);
    } else return S.Nothing;
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on('pointerup', () => {
      if (!this.cellClickDisabled) this.signal([{type: 'CLICK_CELL', cell}]);
    });
  }
  clearAllTileEvents() {
    this.tiles.forEach((tile) => tile.tile.removeAllListeners());
  }
  clearAllTileTint() {
    this.tiles.forEach((tile) => tile.tile.clearTint());
  }
  renderSquads() {
    this.state.squads
      .filter((u) => u.status === 'alive')
      .forEach((unit) => this.renderSquad(unit));
  }

  getCellPositionOnScreen({x, y}: {x: number; y: number}) {
    const pos = this.getPos({x, y});

    return {...pos, y: pos.y + CHARA_VERTICAL_OFFSET};
  }

  renderSquad(squad: MapSquad) {
    const {container} = this.getContainers();
    const squadLeader = Object.values(squad.members).find(mem=>mem.leader);

    if(!squadLeader) throw new Error(INVALID_STATE)

    let leader = this.state.units.find((_,k)=>k === squadLeader.id)

    if(!leader) throw new Error(INVALID_STATE)

    const {x, y} = this.getCellPositionOnScreen(squad.pos);

    const chara = new Chara(
      `unit-${squad.id}`,
      this,
      leader,
      x,
      y,
      CHARA_MAP_SCALE,
      true,
    );

    container.add(chara.container);

    this.charas.push(chara);

    if (this.movedUnits.includes(squad.id)) chara.container.setAlpha(0.5);

    chara.onClick((_: Chara) => {
      this.signal([
        {
          type: 'CLICK_MAP_SQUAD',
          unit: squad,
        },
      ]);
    });
  }

  clickUnit(unit: MapSquad) {
    if (unit.force === PLAYER_FORCE) {
      this.handleClickOnOwnUnit(unit);
    } else {
      this.handleClickOnEnemyUnit(unit);
    }
  }

  showClickableCellsForUnit(un: MapSquad) {
    this.clearTiles();
    const unit = this.state.squads.find((u) => u.id === un.id);
    if (!unit) return;
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

  handleClickOnOwnUnit(unit: MapSquad) {
    if (this.movedUnits.includes(unit.id))
      this.signal([{type: 'CLEAR_TILES'}, {type: 'SHOW_SQUAD_PANEL', unit}]);
    else
      this.signal([
        {type: 'CLEAR_TILES'},
        {type: 'SHOW_SQUAD_PANEL', unit},
        {type: 'SHOW_CLICKABLE_CELLS', unit},
      ]);
  }

  handleClickOnEnemyUnit(enemyUnit: MapSquad) {
    const maybeSelectedUnit = this.getSelectedUnit();

    if (S.isNothing(maybeSelectedUnit)) {
      this.signal([{type: 'SHOW_SQUAD_PANEL', unit: enemyUnit}]);
    } else {
      S.map<MapSquad, void>((selectedUnit) => {
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
              {type: 'SHOW_SQUAD_PANEL', unit: enemyUnit},
            ]);
          }
        })(this.getChara(enemyUnit.id));
      })(maybeSelectedUnit);
    }
  }

  showUnitPanel(unit: MapSquad) {
    this.setSelectedUnit(unit.id);
    this.refreshUI();
  }

  setSelectedUnit(id: string) {
    this.selectedEntity = {type: 'unit', id};
  }

  setSelectedCity(id: string) {
    this.selectedEntity = {type: 'city', id};
  }

  showEnemyUnitMenu(unit: MapSquad, chara: Chara, selectedAlly: MapSquad) {
    this.closeActionWindow();

    this.actionWindow(chara.container.x || 0, chara.container.y || 0, [
      {
        title: 'Attack',
        action: () => {
          this.moveToEnemyUnit(unit, chara, selectedAlly);
        },
      },
      {
        title: 'View',
        action: () => {
          this.moveCameraTo(unit.pos, 500);
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

  moveToEnemyUnit(enemyUnit: MapSquad, _: Chara, selectedAlly: MapSquad) {
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
            onCombatFinish: (cmds: MapCommands[]) => {
              console.log(`cmds::`, cmds);

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
                .filter((v, k) => v.every((n) => n === 0))
                .keySeq()
                .map((target) => ({type: 'DESTROY_TEAM', target}))
                .toJS();

              this.scene.start();
              this.signal(
                cmds.concat(defeated).concat([{type: 'END_SQUAD_TURN'}]),
              );
            },
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
      chara.container.destroy();
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

  refreshUI() {
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

    //UNIT INFORMATION
    if (this.selectedEntity && this.selectedEntity.type === 'unit') {
      const squad = this.getSquad(this.selectedEntity.id);

      this.unitIO((unit) => {
        text(20, 610, squad.name, uiContainer, this);
        text(1000, 610, `${unit.range} cells`, uiContainer, this);

        button(200, 620, 'Squad Details', this.uiContainer, this, () => {
          let charaStats = this.add.container(0, 0);
          panel(50, 50, 1080, 540, this.uiContainer, this);
          this.disableCellClick();
          this.disableCityClick();
          this.dragDisabled = true;

          const boardScene = new BoardScene(squad, 50, -50, 0.7);
          this.scene.add(`board-squad-${squad.id}`, boardScene, true);
          boardScene.onUnitClick((chara) => {
            charaStats.removeAll();

            text(70, 370, chara.unit.name, charaStats, this);

            const lineHeight = 25;
            const baseLine = 400;

            ['str', 'agi', 'dex', 'int', 'wis', 'vit'].forEach((name, i) => {
              text(
                70,
                baseLine + i * lineHeight,
                name.toUpperCase(),
                charaStats,
                this,
              );
              text(
                130,
                baseLine + i * lineHeight,
                (chara.unit as any)[name],
                charaStats,
                this,
              );
            });

            ['Back Row', 'Middle Row', 'Front Row'].forEach((name, i) => {
              text(270, baseLine + i * lineHeight, name, charaStats, this);
              text(500, baseLine + i * lineHeight, '11 x 2', charaStats, this);
            });
          });

          button(900, 120, 'Close', this.uiContainer, this, () => {
            boardScene.destroy(this);

            charaStats.destroy();

            this.dragDisabled = false;
            // TODO: also enable/disable click on units/cities

            this.enableCellClick();
            this.enableCityClick();
            this.refreshUI();
          });
        });
      })(this.selectedEntity.id);

      //CITY INFORMATION
    } else if (this.selectedEntity && this.selectedEntity.type === 'city') {
      this.cityIO((city) => {
        text(20, 610, city.name, uiContainer, this);
        if (city.force)
          text(
            1000,
            610,
            `Controlled by ${this.getForce(city.force).name}`,
            uiContainer,
            this,
          );
      })(this.selectedEntity.id);
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

    let posY = 0;
    this.state.forces
      .filter((f) => f.id === PLAYER_FORCE)
      .map((force) => {
        force.squads
          .map((id) => this.state.squads.find((s) => s.id === id))
          .forEach((sqd) => {
            if (typeof sqd === 'undefined') return;

            posY = posY += 60;

            button(20, posY, this.getSquad(sqd.id).name, uiContainer, this, () => {
              this.signal([
                {type: 'CLICK_MAP_SQUAD', unit: sqd},
                {
                  type: 'MOVE_CAMERA_TO',
                  x: sqd.pos.x,
                  y: sqd.pos.y,
                  duration: 500,
                },
              ]);

              this.refreshUI();
            });
          });
      });

    button(20, posY + 60, '+ Dispatch', uiContainer, this, () => {
      this.renderDispatchWindow();
    });

    button(20, posY + 120, 'End Turn', uiContainer, this, () => {
      this.endTurn();
    });
  }

  renderDispatchWindow() {
    let container = this.add.container();
    panel(100, 100, 500, 500, container, this);

    let x = 120;
    let y = 120;

    button(500, 120, 'Close', container, this, () => {
      container.destroy();
    });

    let currentSquads = new Set(this.state.squads.map((s) => s.id));

    let squadsToRender = this.state.squads.filter(
      (sqd) => !currentSquads.has(sqd.id) && sqd.force === PLAYER_FORCE
    );

    squadsToRender.forEach((sqd, i) => {
      button(x, y + 70 * i, sqd.name, container, this, () => {
        this.dispatchSquad(sqd.id);
        container.destroy();
        this.refreshUI();

        let squad = this.state.squads.find((s) => s.id === sqd.id);
        if (squad) {
          this.signal([
            {type: 'CLICK_MAP_SQUAD', unit: squad},
            {
              type: 'MOVE_CAMERA_TO',
              x: squad.pos.x,
              y: squad.pos.y,
              duration: 500,
            },
          ]);
        }
      });
    });
  }

  getSquad(squadId: string) {
    let squad = this.state.squads.find((s) => s.id === squadId);

    if (!squad) throw new Error(INVALID_STATE);

    return squad;
  }

  dispatchSquad(squadId: string) {
    let force = this.getForce(PLAYER_FORCE);
    let mapSquad = toMapSquad(
      this.getSquad(squadId),
      getCity(force.initialPosition, this.state),
    );

    this.state.squads.push(mapSquad);
    force.squads.push(squadId);

    // TODO: make this a pipeline instead of a side effect
    this.setValidMoves();
    // TODO: add "summon" effect
    this.renderSquad(mapSquad);
  }

  disableCellClick() {
    this.cellClickDisabled = true;
  }

  enableCellClick() {
    this.cellClickDisabled = false;
  }
  disableCityClick() {
    this.cityClickDisabled = true;
  }

  enableCityClick() {
    this.cityClickDisabled = false;
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

    this.setValidMoves();

    console.log(this.movedUnits);

    this.showTurnTitle(force);

    if (force.id === CPU_FORCE) {
      this.dragDisabled = true;
      this.runAi();
    } else {
      this.dragDisabled = false;
      const unit = this.state.squads.filter((u) => u.force === PLAYER_FORCE)[0];
      this.moveCameraTo(unit.pos, 500);
    }
  }

  getAliveUnitsFromForce(forceId: string) {
    return getUnitsFromForce(this.state)(forceId).filter(
      (u) => u.status === 'alive',
    );
  }
  runAi() {
    const remainingUnits = this.getAliveUnitsFromForce(
      this.currentForce,
    ).filter((u) => !this.movedUnits.includes(u.id));

    if (remainingUnits.length < 1) return;

    const unit = remainingUnits[0];
    if (!unit) throw new Error(INVALID_STATE);

    this.moveCameraTo(unit.pos, 200);
    this.setSelectedUnit(unit.id);
    this.refreshUI();

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

      this.moveToTile(unit.id, tile, () => {
        this.signal([{type: 'END_SQUAD_TURN'}]);

        this.setValidMoves();
      });
    }
  }

  checkTurnEnd() {
    const force = this.getCurrentForce();

    this.setValidMoves();

    const aliveUnits = this.getAliveUnitsFromForce(force.id);

    if (this.movedUnits.length === aliveUnits.length) this.endTurn();
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

  showCellMenu(unit: MapSquad, {x, y}: Vector, onMoveComplete: Function) {
    if (this.movedUnits.includes(unit.id)) return;

    this.dragDisabled = true;
    const maybeMapTile = S.find<MapTile>(
      (tile) => tile.x === x && tile.y === y,
    )(this.tiles);

    S.map<MapTile, void>((mapTile) => {
      const {tile} = mapTile;
      this.signal([
        {type: 'CLOSE_ACTION_PANEL'},
        {type: 'SHOW_CLICKABLE_CELLS', unit},
        {type: 'HIGHLIGHT_CELL', pos: {x: mapTile.x, y: mapTile.y}},
      ]);

      const moveAction = () => {
        if (unit.validSteps.some((step) => S.equals(step.target)({x, y})))
          return [
            {
              title: 'Move',
              action: () => {
                //TODO: convert to data
                this.moveToTile(unit.id, mapTile, () => {
                  this.dragDisabled = false;
                  onMoveComplete();
                });
                this.actionWindowContainer?.destroy();
                tile.clearTint();
              },
            },
          ];
        else return [];
      };

      const viewCityAction = () => {
        const maybeCity = this.state.cities.find((c) => c.x === x && c.y === y);

        if (maybeCity) {
          return [
            {
              title: 'Select City',
              action: () => {
                this.dragDisabled = false;
                this.signal([{type: 'SELECT_CITY', id: maybeCity.id}]);
              },
            },
          ];
        } else return [];
      };

      this.actionWindow(
        tile.x + this.mapX,
        tile.y + this.mapY,
        moveAction()
          .concat(viewCityAction())
          .concat([
            {
              title: 'Cancel',
              action: () => {
                this.dragDisabled = false;
                this.signal([
                  {type: 'CLOSE_ACTION_PANEL'},
                  {type: 'SHOW_CLICKABLE_CELLS', unit},
                ]);
              },
            },
          ]),
      );
    })(maybeMapTile);
  }

  showCityInfo(id: string) {
    const city = this.state.cities.find((c) => c.id === id);

    const pic = this.add.sprite(SCREEN_WIDTH / 2, 350, 'merano');
    pic.setOrigin(0.5);
    pic.setDisplaySize(250, 250);
    const name = this.label(SCREEN_WIDTH / 2, 520, 'Merano Castle');
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
  }

  // TODO: simplify interface
  moveToTile(unitId: string, mapTile: MapTile, onMoveComplete: Function) {
    const {x, y} = mapTile;

    // Move unit to tile
    const chara = this.charas.find((c) => c.unit.squad?.id === unitId);
    const force = this.getCurrentForce();

    if (!chara || !force) throw new Error(INVALID_STATE);

    const squad = this.state.squads.find(
      (unit) => unit.id === chara.unit.squad?.id,
    );

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
        this.moveUnit(chara, step.steps, () => {
          S.map<City, void>((city) => {
            if (city.force !== unit.force)
              this.signal([
                {type: 'CAPTURE_CITY', id: city.id, force: squad.force},
              ]);
          })(this.cityAt(x, y));

          onMoveComplete();
        });
      })(maybePath);
    })(unitId);

    this.signal([{type: 'UPDATE_SQUAD_POS', id: squad.id, pos: {x, y}}]);

    this.refreshUI();
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
    return this.state.squads.filter((unit) => unit.force !== this.currentForce);
  }

  getTileAt(x: number, y: number) {
    const tile = this.tiles.find((tile) => tile.x === x && tile.y === y);

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }
}
const formatDataForApi = (state: MapState) => (currentForce: string) => ({
  units: state.squads.filter((u) => u.status === 'alive'),
  forces: state.forces,
  width: 14,
  height: 6,
  walkableCells: [0],
  grid: state.cells.map((col) => col.map((cell) => (cell === 0 ? 0 : 1))),
  currentForce: currentForce,
});
