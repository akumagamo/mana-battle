import * as Phaser from "phaser";
import { Chara } from "../Chara/Chara";
import { getSquads } from "../DB";
import { INVALID_STATE } from "../errors";
import button from "../UI/button";
import { Container, Image, Pointer } from "../Models";
import panel from "../UI/panel";
import text from "../UI/text";
import {
  getPossibleMoves,
  squadsFromForce as getSquadsFromForce,
  getUnit,
} from "../API/Map/api";
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
} from "../API/Map/Model";
import S from "sanctuary";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants";
import { toMapSquad, Unit } from "../Unit/Model";
import { Map } from "immutable";
import { getCity } from "../API/Map/utils";
import { Squad } from "../Squad/Model";
import victoryCondition from "./effects/victoryCondition";
import squadDetails from "./effects/squadDetails";
import speech from "../UI/speech";
import StaticBoardScene from "../Board/StaticBoardScene";

type ActionWindowAction = { title: string; action: () => void };

const WALKABLE_CELL_TINT = 0x88aa88;
const ENEMY_IN_CELL_TINT = 0xff2222;
const SELECTED_TILE_TINT = 0x9955aa;

const SPEED = 1;

const SQUAD_MOVE_DURATION = 200 / SPEED;
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

const CITY_HEAL_PERCENT = 20;

type MapTile = {
  x: number;
  y: number;
  type: number;
  tile: Image;
};

export type MapCommands =
  | { type: "UPDATE_STATE"; target: MapState }
  | { type: "UPDATE_SQUAD_POS"; id: string; pos: Vector }
  | { type: "UPDATE_UNIT"; unit: Unit }
  | {
      type: "DESTROY_TEAM";
      target: string;
    }
  | {
      type: "CLICK_CELL";
      cell: MapTile;
    }
  | {
      type: "CLICK_SQUAD";
      unit: MapSquad;
    }
  | { type: "CLEAR_TILES" }
  | { type: "MOVE_CAMERA_TO"; x: number; y: number; duration: number }
  | { type: "CLEAR_TILES_EVENTS" }
  | { type: "CLEAR_TILES_TINTING" }
  | { type: "SHOW_SQUAD_PANEL"; unit: MapSquad }
  | { type: "SHOW_TARGETABLE_CELLS"; unit: MapSquad }
  | { type: "HIGHLIGHT_CELL"; pos: Vector }
  | { type: "CLOSE_ACTION_PANEL" }
  | { type: "SELECT_CITY"; id: string }
  | { type: "END_SQUAD_TURN" }
  | { type: "CITY_CLICK"; id: string }
  | { type: "CAPTURE_CITY"; id: string; force: string }
  | { type: "RUN_TURN" };

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

  selectedEntity: null | { type: "city" | "unit"; id: string } = null;

  currentForce: string = PLAYER_FORCE;
  /** Units moved by a force in a given turn */
  movedSquads: string[] = [];

  dragState: null | Vector = null;

  mapX: number = 0;
  mapY: number = 0;
  isDragging = false;
  bounds = {
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
  };

  hasShownVictoryCondition = false;
  dragDisabled = false;
  cellClickDisabled = false;
  cityClickDisabled = false;

  cellHighlight: Phaser.GameObjects.Rectangle | null = null;

  // ----- Phaser --------------------
  constructor() {
    super("MapScene");
  }

  signal(cmds: MapCommands[]) {
    cmds.forEach((cmd) => {
      console.log(`SIGNAL::`, cmd);
      if (cmd.type === "DESTROY_TEAM") {
        this.movedSquads = S.reject<string>((id) => id === cmd.target)(
          this.movedSquads
        );

        this.state.mapSquads = this.state.mapSquads.filter(
          (s) => s.id !== cmd.target
        );
        const animation = async () => {
          const chara = await this.getChara(cmd.target);

          chara.fadeOut(() => {});
        };
        this.time.addEvent({
          delay: 100,
          callback: () => animation(),
        });
      } else if (cmd.type === "UPDATE_STATE") {
        this.updateState(cmd.target);
      } else if (cmd.type === "UPDATE_SQUAD_POS") {
        this.state.mapSquads = this.state.mapSquads.map((squad) =>
          squad.id === cmd.id ? { ...squad, pos: cmd.pos } : squad
        );
      } else if (cmd.type === "UPDATE_UNIT") {
        this.state.units = this.state.units.set(cmd.unit.id, cmd.unit);
      } else if (cmd.type === "CLICK_CELL") {
        // The CLICK_CELL event has happened.
        // Here are the possible scenarios:
        // 1 - The user doesn't have a own unit selected. In this case, check
        // if something can be selected in the cell.
        // 2 - The user is currently selecting an own unit. In this case, show
        // the move actions and the units/city in the cell

        if (this.cellClickDisabled) {
          console.log(`cell click disabled! cancelling`);
          return;
        }

        this.clearTiles();

        this.closeActionWindow();
        const { x, y } = cmd.cell;

        const squads = this.state.mapSquads.filter(
          (s) => s.pos.x === x && s.pos.y === y
        );
        const city = this.state.cities.find((c) => c.x === x && c.y === y);

        this.signal([
          { type: "CLEAR_TILES_TINTING" },
          { type: "HIGHLIGHT_CELL", pos: cmd.cell },
        ]);

        if (squads.length === 1 && !city) {
          this.signal([{ type: "CLICK_SQUAD", unit: squads[0] }]);
        } else if (squads.length > 0 || city) {
          this.renderCellMenu(squads, city, cmd.cell);
        } else {
          const selectedUnit = this.getSelectedUnit();

          if (!selectedUnit) return;

          if (selectedUnit.force === PLAYER_FORCE)
            this.showCellMenu(selectedUnit, cmd.cell, async () => {
              const targets = this.targets(cmd.cell);
              const city = this.cityAt(cmd.cell.x, cmd.cell.y);
              if (targets.length > 0 || city)
                this.showSquadActionsMenu(selectedUnit);
              else
                this.finishSquadActions(await this.getChara(selectedUnit.id));
            });
        }
      } else if (cmd.type === "CLICK_SQUAD") {
        this.clickSquad(cmd.unit);
        this.closeActionWindow();
      } else if (cmd.type === "MOVE_CAMERA_TO") {
        this.moveCameraTo({ x: cmd.x, y: cmd.y }, cmd.duration);
      } else if (cmd.type === "SELECT_CITY") {
        this.signal([{ type: "CLOSE_ACTION_PANEL" }, { type: "CLEAR_TILES" }]);
        this.setSelectedCity(cmd.id);
        this.cityIO((c) => {
          this.signal([
            { type: "MOVE_CAMERA_TO", x: c.x, y: c.y, duration: 500 },
          ]);
        })(cmd.id);
      } else if (cmd.type === "CLEAR_TILES") {
        this.clearTiles();
      } else if (cmd.type === "CLEAR_TILES_EVENTS") {
        this.clearAllTileEvents();
      } else if (cmd.type === "CLEAR_TILES_TINTING") {
        this.clearAllTileTint();
      } else if (cmd.type === "SHOW_SQUAD_PANEL") {
        this.showSquadPanel(cmd.unit);
      } else if (cmd.type === "SHOW_TARGETABLE_CELLS") {
        this.showClickableCellsForUnit(cmd.unit);
      } else if (cmd.type === "HIGHLIGHT_CELL") {
        const { x, y } = cmd.pos;
        const mapTile = this.tileAt(x, y);

        this.cellHighlight = this.add.rectangle(
          mapTile.tile.x + this.mapContainer.x,
          mapTile.tile.y + this.mapContainer.y,
          cellSize,
          cellSize
        );

        this.cellHighlight.setStrokeStyle(2, 0x1a65ac);
      } else if (cmd.type === "CLOSE_ACTION_PANEL") {
        this.closeActionWindow();
      } else if (cmd.type === "END_SQUAD_TURN") {
        const aliveIds = this.getAliveSquadsFromForce(this.currentForce).map(
          (u) => u.id
        );
        const defeatedForces = this.getDefeatedForces();

        if (defeatedForces.includes(PLAYER_FORCE)) {
          alert(`Player loses!`);
        } else if (defeatedForces.includes(CPU_FORCE)) {
          alert(`Player wins!`);
        } else if (S.equals(aliveIds)(this.movedSquads)) {
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
          console.log(`=== PLAYER ===`);
        }
      } else if (cmd.type === "RUN_TURN") {
        this.startForceTurn();
      } else if (cmd.type === "CITY_CLICK") {
        this.signal([{ type: "SELECT_CITY", id: cmd.id }]);

        this.refreshUI();
      } else if (cmd.type === "CAPTURE_CITY") {
        this.state.cities = this.state.cities.map((city) =>
          city.id === cmd.id ? { ...city, force: cmd.force } : city
        );
        //this.citySpriteIO((sprite) => sprite.setTint(ALLIED_CITY_TINT))(cmd.id);
      }
    });
  }

  updateState(state: MapState) {
    this.state = state;
  }

  create(data: MapCommands[]) {
    console.log(`CREATE COMMANDS:`, data);
    if (process.env.NODE_ENV !== "production") {
      //@ts-ignore
      window.mapScene = this;
    }
    this.sound.stopAll();
    const music = this.sound.add("map1");

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

    this.renderSquads();
    this.refreshUI();

    this.setWorldBounds();
    this.makeWorldDraggable();

    this.startForceTurn();
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
      })
    );
  }
  delay(delay: number) {
    return new Promise((resolve: any) =>
      this.time.addEvent({
        delay,
        callback: resolve,
      })
    );
  }

  showVictoryCondition() {
    victoryCondition(this);
  }

  /**
   * Moves camera position to a vector in the board. If the position is out of bounds, moves until the limit.
   */
  moveCameraTo(vec: Vector, duration: number) {
    let { x, y } = this.getPos(vec);

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

    return new Promise((resolve) =>
      this.tweens.add({
        targets: this.mapContainer,
        x: tx(),
        y: ty(),
        duration: duration,
        ease: "cubic.out",
        onComplete: () => {
          this.mapX = tx();
          this.mapY = ty();

          resolve();
        },
      })
    );
  }

  setWorldBounds() {
    const rows = this.state.cells[0].length;
    const cols = this.state.cells.length;
    this.bounds = {
      x: { min: -1 * (rows * cellSize - SCREEN_WIDTH), max: 0 },
      y: { min: -1 * (cols * cellSize - SCREEN_HEIGHT), max: 0 },
    };
  }
  label(x: number, y: number, text: string) {
    const container = this.add.container();
    const text_ = this.add.text(x, y, text, {
      fontSize: "36px",
      color: "#000",
    });
    text_.setOrigin(0.5);
    panel(
      text_.x - 20 - text_.width / 2,
      text_.y - 20 - text_.height / 2,
      text_.width + 40,
      text_.height + 40,
      container,
      this
    );

    container.add(text_);

    this.missionContainer.add(container);

    return container;
  }

  makeWorldDraggable() {
    this.mapContainer.setSize(
      this.mapContainer.getBounds().width,
      this.mapContainer.getBounds().height
    );

    this.mapContainer.setInteractive();

    this.input.setDraggable(this.mapContainer);

    this.input.on(
      "drag",
      (_: Pointer, gameObject: Image, dragX: number, dragY: number) => {
        if (this.dragDisabled) return;

        if (!this.isDragging) this.isDragging = true;

        const dx = gameObject.x - dragX;
        const dy = gameObject.y - dragY;

        const mx = this.mapX - dx;
        const my = this.mapY - dy;

        const { x, y } = this.bounds;

        if (mx < x.max && mx > x.min && my < y.max && my > y.min)
          this.mapContainer.setPosition(this.mapX - dx, this.mapY - dy);
        else {
          // Movement bound to one or two corners
          const gx = mx > x.max ? x.max : mx < x.min ? x.min : this.mapX - dx;
          const gy = my > y.max ? y.max : my < y.min ? y.min : this.mapY - dy;

          this.mapContainer.setPosition(gx, gy);
        }
      }
    );

    this.input.on("dragend", (pointer: Pointer) => {
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
        this.delay(20).then(() => {
          this.enableCellClick();
        });
      }
      this.isDragging = false;
    });
  }

  // ------ Internals ----------------

  getContainers() {
    return { container: this.mapContainer, uiContainer: this.uiContainer };
  }

  tileAt(x: number, y: number) {
    const tile = this.tiles.find((t) => t.x === x && t.y === y);
    if (!tile) throw new Error(INVALID_STATE);
    return tile;
  }
  cityAt(x: number, y: number) {
    return this.state.cities.find((c) => c.x === x && c.y === y);
  }

  getValidMoves() {
    console.log(`SET VALID MOVES`);
    const moveList = getPossibleMoves(
      formatDataForApi(this.state)(this.currentForce)
    );

    const squads = getSquadsFromForce(this.state)(this.currentForce);

    moveList.forEach((move) => {
      const squad = squads.find((s) => s.id === move.id);

      if (!squad) throw new Error(INVALID_STATE);

      //TODO: remove functor from enemiesInRange
      squad.enemiesInRange = move.enemiesInRange;
      squad.validSteps = move.validSteps;
    });
  }

  getForce(id: string) {
    const force = this.state?.forces.find((force) => force.id === id);
    if (!force) throw new Error(INVALID_STATE);
    return force;
  }

  forceIO(id: string, fn: (f: Force) => void) {
    S.map<Force, void>(fn)(
      S.find<Force>((f) => f.id === id)(this.state.forces)
    );
  }

  getUnit(id: string) {
    let u = getUnit(this.state)(id);

    if (!u) throw new Error(INVALID_STATE);
    return u;
  }
  mapUnit = <A>(fn: (u: MapSquad) => A) => (id: string) =>
    S.map<MapSquad, A>((unit) => fn(unit))(this.getUnit(id));

  squadIO = async (id: string) => {
    let sqd = this.state.mapSquads.find((s) => s.id === id);

    if (!sqd) throw new Error(INVALID_STATE);

    return sqd;
  };

  cityIO = (fn: (u: City) => void) => (id: string) => {
    S.map<City, void>((unit) => fn(unit))(
      S.find<City>((c) => c.id === id)(this.state.cities)
    );
  };

  citySpriteIO = (fn: (u: Image) => void) => (id: string) => {
    S.map<Image, void>((unit) => fn(unit))(
      S.find<Image>((c) => c.name === id)(this.citySprites)
    );
  };

  getDefeatedForces(): string[] {
    return this.state.forces
      .map((f) => f.id)
      .reduce((xs, x) => {
        const allDefeated = this.state.mapSquads
          .filter((u) => u.force === x)
          .every((u) => u.status === "defeated");

        if (allDefeated) return xs.concat([x]);
        else return xs;
      }, [] as string[]);
  }

  getCurrentForce() {
    return this.getForce(this.currentForce);
  }

  getPos({ x, y }: Vector) {
    return {
      x: boardPadding + x * cellSize,
      y: boardPadding + y * cellSize,
    };
  }

  renderStructures() {
    this.state.cities.forEach((city) => {
      const { x, y } = this.getPos({ x: city.x, y: city.y });

      const city_ = this.add.image(x, y, `tiles/${city.type}`);

      city_.setScale(CITY_SCALE);

      if (city.force === "PLAYER_FORCE") {
        //city_.setTint(ALLIED_CITY_TINT);
      } else {
        //city_.setTint(ENEMY_CITY_TINT);
      }
      // city_.setInteractive();
      // city_.on('pointerup', () => {
      //   if (!this.cityClickDisabled)
      //     this.signal([{type: 'CITY_CLICK', id: city.id}]);
      // });
      this.mapContainer.add(city_);
      city_.name = city.id;
      this.citySprites.push(city_);
    });
  }
  renderMap() {
    const { container } = this.getContainers();
    translateTiles(this.state.cells).forEach((arr, col) =>
      arr.forEach((n, row) => {
        const { x, y } = this.getPos({ x: row, y: col });

        const tile = this.add.image(x, y, `tiles/${tileMap[n]}`);

        tile.setInteractive();

        container.add(tile);

        this.input.setDraggable(tile);

        tile.displayWidth = cellSize;
        tile.displayHeight = cellSize;

        const mapTile = {
          x: row,
          y: col,
          type: n,
          tile: tile,
        };
        this.tiles.push(mapTile);

        this.makeInteractive(mapTile);
      })
    );
  }
  getSelectedUnit() {
    if (this.selectedEntity && this.selectedEntity.type === "unit") {
      return this.getUnit(this.selectedEntity.id);
    }
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on("pointerup", (pointer: Pointer) => {
      console.log(`click:`, cell);
      if (!this.cellClickDisabled) this.signal([{ type: "CLICK_CELL", cell }]);

      var ping = this.add.circle(pointer.upX, pointer.upY, 20, 0xffff66);

      this.tween({
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
      this.tweens.killTweensOf(tile.tile);
    });
  }
  clearAllTileTint() {
    this.tiles.forEach((tile) => tile.tile.clearTint());
  }
  renderSquads() {
    this.state.mapSquads
      .filter((u) => u.status === "alive")
      .forEach((unit) => this.renderSquad(unit));
  }

  getCellPositionOnScreen({ x, y }: { x: number; y: number }) {
    const pos = this.getPos({ x, y });

    return { ...pos, y: pos.y + CHARA_VERTICAL_OFFSET };
  }

  renderSquad(squad: MapSquad) {
    const { container } = this.getContainers();
    const squadLeader = Object.values(squad.members).find((mem) => mem.leader);

    if (!squadLeader) throw new Error(INVALID_STATE);

    let leader = this.state.units.find((_, k) => k === squadLeader.id);

    if (!leader) throw new Error(INVALID_STATE);

    const { x, y } = this.getCellPositionOnScreen(squad.pos);

    const chara = new Chara(
      this.charaKey(squad.id),
      this,
      leader,
      x,
      y,
      CHARA_MAP_SCALE,
      true
    );

    container.add(chara.container);

    this.charas.push(chara);

    if (this.movedSquads.includes(squad.id)) chara.container.setAlpha(0.5);
  }

  clickSquad(unit: MapSquad) {
    console.log(`force is..`, unit.force);
    if (unit.force === PLAYER_FORCE) {
      this.handleClickOnOwnUnit(unit);
    } else {
      this.handleClickOnEnemyUnit(unit);
    }
  }

  showClickableCellsForUnit(un: MapSquad) {
    this.clearTiles();
    const unit = this.state.mapSquads.find((u) => u.id === un.id);
    if (!unit) return;

    unit.validSteps.forEach((cell) =>
      this.makeCellClickable(this.tileAt(cell.target.x, cell.target.y))
    );
  }

  highlightAttackableCells(mapSquad: MapSquad) {
    this.targets(mapSquad.pos).forEach((e) => {
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

  async getChara(unitId: string) {
    const chara = this.charas.find((c) => c.key === this.charaKey(unitId));

    if (!chara) throw new Error("Invalid ID");

    return chara;
  }

  charaKey(squadId: string) {
    return `unit-${squadId}`;
  }

  handleClickOnOwnUnit(squad: MapSquad) {
    if (this.movedSquads.includes(squad.id))
      this.signal([
        { type: "CLEAR_TILES" },
        { type: "SHOW_SQUAD_PANEL", unit: squad },
      ]);
    else {
      this.signal([
        { type: "CLEAR_TILES" },
        { type: "SHOW_SQUAD_PANEL", unit: squad },
        { type: "SHOW_TARGETABLE_CELLS", unit: squad },
      ]);
      this.highlightAttackableCells(squad); // TODO: add to signals
      this.makeCellAttackable(squad);
    }
  }

  async handleClickOnEnemyUnit(enemyUnit: MapSquad) {
    const selectedUnit = this.getSelectedUnit();

    if (!selectedUnit) {
      // TODO: done rely on selected unit status (use state machine)
      this.signal([{ type: "SHOW_SQUAD_PANEL", unit: enemyUnit }]);
    } else {
      let action = (selectedUnit: MapSquad, chara_: Chara) => {
        const isInRange = S.elem(enemyUnit.id)(
          S.map<EnemyInRange, string>((e) => e.enemy)(
            selectedUnit.enemiesInRange
          )
        );

        if (
          selectedUnit.force === PLAYER_FORCE &&
          isInRange &&
          !this.movedSquads.includes(selectedUnit.id)
        ) {
          this.showEnemyUnitMenu(enemyUnit, chara_, selectedUnit);
          this.signal([
            { type: "CLEAR_TILES" },
            { type: "SHOW_TARGETABLE_CELLS", unit: selectedUnit },
          ]);
        } else {
          this.signal([
            { type: "CLEAR_TILES" },
            { type: "SHOW_SQUAD_PANEL", unit: enemyUnit },
          ]);
        }
      };

      const enemyChara_ = await this.getChara(enemyUnit.id);

      action(selectedUnit, enemyChara_);
    }
  }

  showSquadPanel(squad: MapSquad) {
    this.setSelectedUnit(squad.id);
    this.refreshUI();
  }

  setSelectedUnit(id: string) {
    this.selectedEntity = { type: "unit", id };
  }

  setSelectedCity(id: string) {
    this.selectedEntity = { type: "city", id };
  }

  showEnemyUnitMenu(
    enemySquad: MapSquad,
    enemyChara: Chara,
    selectedAlly: MapSquad
  ) {
    this.closeActionWindow();

    this.actionWindow(
      enemyChara.container.x + this.mapX || 0,
      enemyChara.container.y + this.mapY || 0,
      [
        {
          title: "Attack",
          action: () => {
            this.moveToEnemyUnit(enemySquad, selectedAlly);
          },
        },
        {
          title: "View",
          action: () => {
            this.moveCameraTo(enemySquad.pos, 500);
            this.showSquadPanel(enemySquad);
            this.clearTiles();
            this.closeActionWindow();
          },
        },
        {
          title: "Cancel",
          action: () => {
            this.closeActionWindow();
          },
        },
      ]
    );
  }
  attack = (starter: MapSquad, target: MapSquad) => {
    this.turnOff();

    const isPlayer = starter.force === PLAYER_FORCE;

    this.scene.transition({
      target: "CombatScene",
      duration: 0,
      moveBelow: true,
      data: {
        squads: this.state.mapSquads,
        units: this.state.units,
        top: isPlayer ? target.id : starter.id,
        bottom: isPlayer ? starter.id : target.id,
        onCombatFinish: (cmds: MapCommands[]) => {
          console.log(`cmds::`, cmds);

          let squads = cmds.reduce((xs, x) => {
            if (x.type === "UPDATE_UNIT") {
              let sqdId = x.unit.squad?.id || "";

              if (!xs[sqdId]) {
                xs[sqdId] = [];
              }

              xs[sqdId].push(x.unit.currentHp);
            }

            return xs;
          }, {} as { [x: string]: number[] });

          let defeated = Map(squads)
            .filter((v, k) => v.every((n) => n === 0))
            .keySeq()
            .map((target) => ({ type: "DESTROY_TEAM", target }))
            .toJS();

          this.scene.start(
            "MapScene",
            cmds.concat(defeated).concat([{ type: "END_SQUAD_TURN" }])
          );
        },
      },
    });
  };

  moveToEnemyUnit(enemySquad: MapSquad, selectedAlly: MapSquad) {
    console.log(`moving to enemy unit...`);
    const enemy = S.find<EnemyInRange>((e) => e.enemy === enemySquad.id)(
      selectedAlly.enemiesInRange
    );
    this.movedSquads.push(selectedAlly.id);
    if (S.isJust(enemy)) {
      S.map<EnemyInRange, void>((e) => {
        S.map<Chara, void>((chara) => {
          const target = e.steps;
          this.moveUnit(chara, target).then(() => {
            console.log(`initiating attack`);
            this.attack(selectedAlly, enemySquad);
          });
        })(this.getChara(selectedAlly.id));
      })(enemy);
    } else {
      console.error(`This should be impossible, check logic`);
      this.showSquadPanel(enemySquad);
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

  makeCellClickable(cell: MapTile) {
    cell.tile.setTint(WALKABLE_CELL_TINT);
    //this.makeInteractive(cell);
  }

  async refreshUI() {
    const { container, uiContainer } = this.getContainers();
    uiContainer.removeAll();

    uiContainer.add(
      panel(
        BOTTOM_PANEL_X,
        BOTTOM_PANEL_Y,
        BOTTOM_PANEL_WIDTH,
        BOTTOM_PANEL_HEIGHT,
        uiContainer,
        this
      )
    );

    //UNIT INFORMATION
    if (this.selectedEntity && this.selectedEntity.type === "unit") {
      const squad = await this.squadIO(this.selectedEntity.id);

      text(20, 610, squad.name, uiContainer, this);
      text(1000, 610, `${squad.range} cells`, uiContainer, this);

      button(200, 620, "Squad Details", this.uiContainer, this, () =>
        squadDetails(
          this,
          squad,
          this.state.units
            .toList()
            .filter((u) => Object.keys(squad.members).includes(u.id))
            .toJS()
        )
      );

      //CITY INFORMATION
    } else if (this.selectedEntity && this.selectedEntity.type === "city") {
      this.cityIO((city) => {
        text(20, 610, city.name, uiContainer, this);
        if (city.force)
          text(
            1000,
            610,
            `Controlled by ${this.getForce(city.force).name}`,
            uiContainer,
            this
          );
      })(this.selectedEntity.id);
    }

    button(1100, 50, "Return to Title", uiContainer, this, () => {
      container.removeAll();
      uiContainer.removeAll();
      this.charas.forEach((c) => this.scene.remove(c.scene.key));
      this.charas = [];
      this.tiles = [];

      this.scene.transition({
        target: "TitleScene",
        duration: 0,
        moveBelow: true,
      });
    });

    // Squad List (Left Navbar)
    let posY = 0;
    this.state.forces
      .filter((f) => f.id === PLAYER_FORCE)
      .map((force) => {
        force.squads
          .map((id) => this.state.mapSquads.find((s) => s.id === id))
          .forEach((sqd) => {
            if (typeof sqd === "undefined") return;

            posY = posY += 60;

            button(
              20,
              posY,
              this.getSquad(sqd.id).name,
              uiContainer,
              this,
              () => {
                this.signal([
                  { type: "CLICK_SQUAD", unit: sqd },
                  {
                    type: "MOVE_CAMERA_TO",
                    x: sqd.pos.x,
                    y: sqd.pos.y,
                    duration: 500,
                  },
                ]);

                this.refreshUI();
              },
              this.movedSquads.includes(sqd.id)
            );
          });
      });

    button(20, posY + 60, "+ Dispatch", uiContainer, this, () => {
      this.renderDispatchWindow();
    });

    if (this.currentForce === PLAYER_FORCE)
      button(1150, 650, "End Turn", uiContainer, this, () => {
        this.endTurn();
      });
  }

  renderDispatchWindow() {
    let container = this.add.container();
    panel(100, 100, 500, 500, container, this);

    let x = 120;
    let y = 120;

    button(500, 120, "Close", container, this, () => {
      container.destroy();
    });

    let currentSquads = new Set(this.getPlayerSquads().map((s) => s.id));

    // TODO: avoid listing defeated squads
    let squadsToRender = Object.values(getSquads()).filter(
      (sqd) => !currentSquads.has(sqd.id)
    );

    squadsToRender.forEach((sqd, i) => {
      button(x, y + 70 * i, sqd.name, container, this, () => {
        this.dispatchSquad(sqd);
        container.destroy();
        this.refreshUI();

        let squad = this.state.mapSquads.find((s) => s.id === sqd.id);
        if (squad) {
          this.signal([
            { type: "CLICK_SQUAD", unit: squad },
            {
              type: "MOVE_CAMERA_TO",
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

  dispatchSquad(squad: Squad) {
    this.forceIO(PLAYER_FORCE, (force) => {
      let mapSquad = toMapSquad(
        squad,
        getCity(force.initialPosition, this.state)
      );

      this.state.mapSquads.push(mapSquad);
      force.squads.push(squad.id);

      // TODO: make this a pipeline instead of a side effect
      this.getValidMoves();
      // TODO: add "summon" effect
      this.renderSquad(mapSquad);
    });
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
      (force) => force.id !== this.currentForce
    );
    if (!force) throw new Error(INVALID_STATE);
    this.currentForce = force.id;
  }

  async startForceTurn() {
    const force = this.getForce(this.currentForce);

    this.getValidMoves();

    await this.showTurnTitle(force);

    this.healUnits(force);

    if (force.id === CPU_FORCE) {
      this.disableInput();
      setTimeout(() => {
        this.runAi();
      }, 300);
    } else {
      this.enableInput();
      const unit = this.state.mapSquads.filter(
        (u) => u.force === PLAYER_FORCE
      )[0];
      this.moveCameraTo(unit.pos, 500);
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

  disableInput() {
    this.dragDisabled = true;
    this.disableCityClick();
    this.disableCellClick();
  }

  enableInput() {
    this.dragDisabled = false;
    this.enableCityClick();
    this.enableCellClick();
  }

  getAliveSquadsFromForce(forceId: string) {
    return getSquadsFromForce(this.state)(forceId).filter(
      (u) => u.status === "alive"
    );
  }
  /**
   * @TODO: refactor to make this return a list of ai actions
   * its hard to debug by going into other methods
   */
  async runAi() {
    console.log(`=== AI ===`);
    this.getValidMoves();

    const remainingUnits = this.getAliveSquadsFromForce(CPU_FORCE).filter(
      (u) => !this.movedSquads.includes(u.id)
    );

    const [currentSquad] = remainingUnits;
    if (!currentSquad) {
      console.log(`no remainingUnits!`);
      this.switchForce();
      this.startForceTurn();
      return;
    }

    let aiMode = this.state.ai.get(currentSquad.id);

    if (aiMode === "DEFEND") {
      console.log(`Squad ${currentSquad.id} set to defend. Ending turn`);
      this.movedSquads.push(currentSquad.id);

      this.signal([{ type: "END_SQUAD_TURN" }]);
      return;
    }

    this.moveCameraTo(currentSquad.pos, 200);
    this.setSelectedUnit(currentSquad.id);
    this.refreshUI();

    const enemyInRange = currentSquad.enemiesInRange[0];

    if (enemyInRange) {
      console.log(`there are enemies in range, attacking`);
      const enemySquad = await this.squadIO(enemyInRange.enemy);
      this.moveToEnemyUnit(enemySquad, currentSquad);
    } else {
      console.log(`no enemies in range, moving to random location`);

      const { x, y } = (currentSquad.validSteps.first() as ValidStep).steps[1];

      const tile = this.getTileAt(x, y);

      this.moveToTile(currentSquad.id, tile, () => {
        this.signal([{ type: "END_SQUAD_TURN" }]);
      });
    }
  }

  checkTurnEnd() {
    const force = this.getCurrentForce();

    const aliveUnits = this.getAliveSquadsFromForce(force.id);

    this.getValidMoves();

    if (this.movedSquads.length === aliveUnits.length) this.endTurn();
  }

  async showTurnTitle(force: Force) {
    const title = this.add.text(-200, 500, `${force.name} Turn`, {
      fontSize: 36,
    });

    return new Promise((resolve) => {
      const timeline = this.tweens.createTimeline({
        onComplete: () => resolve(),
      });
      timeline.add({
        targets: title,
        x: 400,
        duration: 300,
      });
      timeline.add({
        targets: title,
        x: 800,
        duration: 1200,
      });
      timeline.add({
        targets: title,
        x: 2000,
        duration: 500,
      });

      timeline.play();
    });
  }

  tilesInRange(x: number, y: number, range: number) {
    return this.tiles.filter(
      (tile) => this.getDistance({ x, y }, tile) <= range
    );
  }

  getDistance(source: Vector, target: Vector) {
    return Math.abs(target.x - source.x) + Math.abs(target.y - source.y);
  }

  clearTiles() {
    this.clearAllTileTint();

    if (this.cellHighlight) this.cellHighlight.destroy();
    //  this.clearAllTileEvents();
  }

  closeActionWindow() {
    this.actionWindowContainer?.destroy();
  }

  showCellMenu(squad: MapSquad, { x, y }: Vector, onMoveComplete: Function) {
    if (this.movedSquads.includes(squad.id)) return;

    this.dragDisabled = true;
    const mapTile = this.tiles.find((tile) => tile.x === x && tile.y === y);

    if (!mapTile) throw new Error("Invalid tile position.");

    const { tile } = mapTile;
    this.signal([
      { type: "CLOSE_ACTION_PANEL" },
      { type: "SHOW_TARGETABLE_CELLS", unit: squad },
      { type: "HIGHLIGHT_CELL", pos: { x: mapTile.x, y: mapTile.y } },
    ]);

    const moveAction = () => {
      if (squad.validSteps.some((step) => S.equals(step.target)({ x, y })))
        return [
          {
            title: "Move",
            action: () => {
              //TODO: convert to data
              this.moveToTile(squad.id, mapTile, () => {
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
            title: "Select City",
            action: () => {
              this.dragDisabled = false;
              this.signal([{ type: "SELECT_CITY", id: maybeCity.id }]);
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
            title: "Cancel",
            action: () => {
              this.dragDisabled = false;
              this.signal([
                { type: "CLOSE_ACTION_PANEL" },
                { type: "SHOW_TARGETABLE_CELLS", unit: squad },
              ]);
            },
          },
        ])
    );
  }

  showCityInfo(id: string) {
    const city = this.state.cities.find((c) => c.id === id);

    const pic = this.add.sprite(SCREEN_WIDTH / 2, 350, "merano");
    pic.setOrigin(0.5);
    pic.setDisplaySize(250, 250);
    const name = this.label(SCREEN_WIDTH / 2, 520, "Merano Castle");
  }

  actionWindow(x: number, y: number, actions: ActionWindowAction[]) {
    if (this.actionWindowContainer) this.actionWindowContainer.destroy();
    this.actionWindowContainer = this.add.container(x, y);
    const btns = actions.map(({ title, action }, index) => {
      if (!this.actionWindowContainer) throw new Error(INVALID_STATE);
      return button(
        20,
        index * 50,
        title,
        this.actionWindowContainer,
        this,
        action
      );
    });
  }

  // TODO: simplify interface
  // wtf: moveToTile and moveunit???
  async moveToTile(
    squadId: string,
    mapTile: MapTile,
    onMoveComplete: Function
  ) {
    const { x, y } = mapTile;

    console.log(`moving`, squadId);
    // Move unit to tile
    const chara = this.charas.find((c) => c.key === this.charaKey(squadId));
    const force = this.getCurrentForce();

    if (!chara || !force) throw new Error(INVALID_STATE);

    this.tiles.forEach((tile) =>
      walkableTiles.includes(tile.type) ? tile.tile.clearTint() : null
    );

    this.clearTiles();

    this.movedSquads.push(squadId);

    const mapSquad = await this.squadIO(squadId);
    const step = mapSquad.validSteps.find((step) =>
      Map(step.target).equals(Map({ x, y }))
    );

    if (!step) throw new Error(INVALID_STATE);

    this.moveUnit(chara, step.steps).then(() => {
      const city = this.cityAt(x, y);
      if (city && city.force !== mapSquad.force)
        this.signal([
          { type: "CAPTURE_CITY", id: city.id, force: mapSquad.force },
        ]);

      this.signal([{ type: "UPDATE_SQUAD_POS", id: squadId, pos: { x, y } }]);

      //TODO: having onMoveComplete AND this firing signals makes no sense
      onMoveComplete();

      this.refreshUI();
    });
  }
  endTurn() {
    this.selectedEntity = null;
    setTimeout(() => {
      this.refreshUI();
    }, 50);
    this.clearTiles();
    this.movedSquads = [];
    this.charas.forEach((u) => u.container?.setAlpha(1));
    this.switchForce();
    this.startForceTurn();
  }

  // TODO: simplify interface (require only ids)
  async moveUnit(chara: Chara, path: Vector[]) {
    let squad = this.state.mapSquads.find(
      (s) => this.charaKey(s.id) === chara.key
    );

    if (squad) squad.pos = path[path.length - 1];

    const tweens = path
      .filter((_, index) => index > 0)
      .map((pos) => {
        const target = this.getCellPositionOnScreen(pos);
        return {
          targets: chara.container,
          x: target.x,
          y: target.y,
          duration: SQUAD_MOVE_DURATION,
          ease: "Cubic",
        };
      });

    //if unit is
    //
    //
    if (tweens.length > 0)
      return new Promise((resolve) => {
        this.tweens.timeline({
          tweens,
          onComplete: () => {
            resolve();
          },
        });
      });
    else return new Promise((resolve) => resolve());
  }

  isEnemyInTile(tile: Vector) {
    return this.getEnemies().some(
      ({ pos: { x, y } }) => x === tile.x && y === tile.y
    );
  }

  getEnemies() {
    return this.state.mapSquads.filter(
      (unit) => unit.force !== this.currentForce
    );
  }

  getTileAt(x: number, y: number) {
    const tile = this.tiles.find((tile) => tile.x === x && tile.y === y);

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }

  showActionMenu({
    chara,
    cell,
    onAttack,
    onWait,
  }: {
    chara: Chara;
    cell: Vector;
    onAttack: () => void;
    onWait: () => void;
  }) {
    const targets = this.targets(cell);

    console.log(`targets:::`, targets);
    this.disableCellClick();

    const maybeAttack =
      targets.length > 0
        ? [
            {
              title: "Attack",
              action: () => {
                onAttack();
                this.enableCellClick();
              },
            },
          ]
        : [];

    const wait = [
      {
        title: "Wait",
        action: () => {
          this.enableCellClick();
          onWait();
        },
      },
    ];

    this.actionWindow(
      chara.container.x + this.mapX || 0,
      chara.container.y + this.mapY || 0,
      //@ts-ignore
      [].concat(maybeAttack).concat(wait)
    );
  }
  targets = (cell: Vector): MapSquad[] => {
    const enemies = this.getEnemies();

    const coords = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    return coords.reduce((xs, [x, y]) => {
      const target = enemies.find(
        (e) => e.pos.x + x === cell.x && e.pos.y + y === cell.y
      );

      if (target) return xs.concat([target]);
      else return xs;
    }, [] as MapSquad[]);
  };

  async showSquadActionsMenu(squad: MapSquad) {
    const chara = await this.getChara(squad.id);

    this.showActionMenu({
      chara,
      cell: squad.pos,
      onAttack: () => {
        this.signal([{ type: "CLOSE_ACTION_PANEL" }]);
        this.highlightAttackableCells(squad);
        this.makeCellAttackable(squad);
      },
      onWait: () => {
        this.signal([{ type: "CLOSE_ACTION_PANEL" }]);
        this.finishSquadActions(chara);
        //this.checkTurnEnd();
      },
    });
  }

  finishSquadActions(chara: Chara) {
    chara.container.setAlpha(0.5);

    this.signal([{ type: "END_SQUAD_TURN" }]);
  }

  async makeCellAttackable(playerSquad: MapSquad) {
    const enemies = this.targets(playerSquad.pos);
    enemies.forEach(async (e) => {
      const enemyChara = await this.getChara(e.id);
      console.log(`making enemy clickable...`);
      enemyChara.container.removeAllListeners();
      enemyChara.onClick(() =>
        this.actionWindow(
          enemyChara.container.x + this.mapX || 0,
          enemyChara.container.y + this.mapY || 0,
          [
            {
              title: "Attack Squad",
              action: async () => {
                const baseX = 200;
                const baseY = 200;

                const scale = 0.5;
                const leader = this.getSelectedSquadLeader(playerSquad.id);
                this.clearAllTileEvents();
                this.clearTiles();
                this.closeActionWindow();

                const enemySquad = this.getSquad(enemyChara.unit.squad.id);
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
                  true
                );

                this.scene.add("enemy_board", enemy, true);

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
                  false
                );

                this.scene.add("ally_board", ally, true);

                const { portrait } = speech(
                  leader,
                  450,
                  70,
                  "Ready for Combat",
                  this.uiContainer,
                  this
                );

                await this.delay(3000);

                this.scene.remove(portrait.scene.key);

                ally.destroy(this);
                enemy.destroy(this);

                this.attack(playerSquad, e);

                //TODO: add transition
              },
            },
            {
              title: "View",
              action: () => {
                this.clearAllTileEvents();
                this.clearTiles();
                this.closeActionWindow();
                this.setSelectedUnit(e.id);
                this.refreshUI();
              },
            },

            {
              title: "Cancel",
              action: () => {
                this.clearAllTileEvents();
                this.clearTiles();
                this.closeActionWindow();
              },
            },
          ]
        )
      );
    });
  }

  renderCellMenu(squads: MapSquad[], city: City | undefined, cell: MapTile) {
    let currentSquad: MapSquad | undefined = undefined;

    if (
      this.selectedEntity?.type === "unit" &&
      !this.movedSquads.includes(this.selectedEntity.id)
    ) {
      currentSquad = this.state.mapSquads.find(
        (s) => s.id === this.selectedEntity?.id && s.force === PLAYER_FORCE
      );
    }

    const moveAction =
      currentSquad &&
      currentSquad.validSteps.some((step) =>
        S.equals(step.target)({ x: cell.x, y: cell.y })
      )
        ? [
            {
              title: "Move",
              action: () => {
                if (currentSquad)
                  this.moveToTile(currentSquad.id, cell, async () => {
                    if (!currentSquad) return; // TODO: this is bad

                    const city = this.cityAt(cell.x, cell.y);

                    if (this.targets(cell).length > 0 || city)
                      this.showSquadActionsMenu(currentSquad);
                    else
                      this.finishSquadActions(
                        await this.getChara(currentSquad.id)
                      );
                  });

                this.actionWindowContainer?.destroy();
              },
            },
          ]
        : [];

    const actions = ([] as ActionWindowAction[])
      .concat(moveAction)
      .concat(
        squads.map((sqd) => ({
          title: `Squad - ${sqd.name}${
            this.movedSquads.includes(sqd.id) ? " (Moved)" : ""
          }`,
          action: () => {
            this.signal([{ type: "CLICK_SQUAD", unit: sqd }]);
          },
        }))
      )
      .concat(
        city
          ? [
              {
                title: `City - ${city.name}`,
                action: () => {
                  this.signal([{ type: "CITY_CLICK", id: city.id }]);
                },
              },
            ]
          : []
      );

    this.actionWindow(
      cell.tile.x + this.mapX,
      cell.tile.y + this.mapY,
      actions
    );
  }
}
const formatDataForApi = (state: MapState) => (currentForce: string) => ({
  mapSquads: state.mapSquads.filter((u) => u.status === "alive"),
  forces: state.forces,
  width: 14,
  height: 6,
  walkableCells: [0],
  grid: state.cells.map((col) => col.map((cell) => (cell === 0 ? 0 : 1))),
  currentForce: currentForce,
});
