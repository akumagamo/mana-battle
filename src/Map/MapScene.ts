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
  getSquad,
} from "../API/Map/api";
import {
  Vector,
  MapSquad,
  MapState,
  Force,
  ValidStep,
  City,
  PLAYER_FORCE,
  CPU_FORCE,
} from "../API/Map/Model";
import S from "sanctuary";
import { SCREEN_WIDTH, SCREEN_HEIGHT, centerX, centerY } from "../constants";
import { toMapSquad, Unit } from "../Unit/Model";
import { Map, Set } from "immutable";
import { getCity } from "../API/Map/utils";
import { Squad } from "../Squad/Model";
import victoryCondition from "./effects/victoryCondition";
import squadDetails from "./effects/squadDetails";
import speech from "../UI/speech";
import StaticBoardScene from "../Board/StaticBoardScene";
import clickCell from "./board/clickCell";
import renderMap from "./board/renderMap";
import renderSquads, { renderSquad } from "./board/renderSquads";

type ActionWindowAction = { title: string; action: () => void };

const WALKABLE_CELL_TINT = 0x88aa88;
const ENEMY_IN_CELL_TINT = 0xff2222;

const SPEED = 1;

const SQUAD_MOVE_DURATION = 200 / SPEED;
const CHARA_VERTICAL_OFFSET = -10;

const CITY_SCALE = 0.5;

const BOTTOM_PANEL_X = 0;
const BOTTOM_PANEL_Y = 600;
const BOTTOM_PANEL_WIDTH = 1280;
const BOTTOM_PANEL_HEIGHT = 120;

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
  | { type: "SET_SELECTED_UNIT"; id: string }
  | { type: "VIEW_SQUAD_DETAILS"; id: string }
  | { type: "END_SQUAD_TURN" }
  | { type: "REFRESH_UI" }
  | { type: "CITY_CLICK"; id: string }
  | { type: "CAPTURE_CITY"; id: string; force: string }
  | { type: "RUN_TURN" }
  | { type: "MOVE_SQUAD"; mapTile: MapTile; squad: MapSquad };

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

  signal(eventName: string, cmds: MapCommands[]) {
    console.log(`💁‍♀️ SIGNAL::: ${eventName}`, cmds);
    cmds.forEach(async (cmd) => {
      console.time(cmd.type);
      if (cmd.type === "DESTROY_TEAM") {
        this.destroySquad(cmd.target);
      } else if (cmd.type === "UPDATE_STATE") {
        this.updateState(cmd.target);
      } else if (cmd.type === "UPDATE_SQUAD_POS") {
        this.state.mapSquads = this.state.mapSquads.map((squad) =>
          squad.id === cmd.id ? { ...squad, pos: cmd.pos } : squad
        );
      } else if (cmd.type === "UPDATE_UNIT") {
        this.state.units = this.state.units.set(cmd.unit.id, cmd.unit);
      } else if (cmd.type === "CLICK_CELL") {
        if (this.cellClickDisabled) {
          console.log(`cell click disabled! cancelling`);
          return;
        }
        clickCell(this, cmd.cell);
      } else if (cmd.type === "CLICK_SQUAD") {
        this.clickSquad(cmd.unit);
        this.closeActionWindow();
      } else if (cmd.type === "MOVE_CAMERA_TO") {
        this.moveCameraTo({ x: cmd.x, y: cmd.y }, cmd.duration);
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
        this.highlightCell(cmd);
      } else if (cmd.type === "CLOSE_ACTION_PANEL") {
        this.closeActionWindow();
      } else if (cmd.type === "SET_SELECTED_UNIT") {
        this.selectedEntity = { type: "unit", id: cmd.id };
      } else if (cmd.type === "VIEW_SQUAD_DETAILS") {
        this.viewSquadDetails(cmd.id);
      } else if (cmd.type === "REFRESH_UI") {
        this.refreshUI();
      } else if (cmd.type === "END_SQUAD_TURN") {
        this.endSquadTurn();
      } else if (cmd.type === "RUN_TURN") {
        this.startForceTurn();
      } else if (cmd.type === "CITY_CLICK") {
        this.selectCity(cmd.id);
      } else if (cmd.type === "CAPTURE_CITY") {
        this.captureCity(cmd);
      } else if (cmd.type === "MOVE_SQUAD") {
        this.moveSquad(cmd);
      }
      console.timeEnd(cmd.type);
    });

    console.log(`🙅‍♀️ ::: finish signal ${eventName}`);
  }

  private captureCity(cmd: {
    type: "CAPTURE_CITY";
    id: string;
    force: string;
  }) {
    this.state.cities = this.state.cities.map((city) =>
      city.id === cmd.id ? { ...city, force: cmd.force } : city
    );
  }

  private moveSquad(cmd: {
    type: "MOVE_SQUAD";
    mapTile: MapTile;
    squad: MapSquad;
  }) {
    const { squad, mapTile } = cmd;
    const callback = async () => {
      this.dragDisabled = false;

      const targets = this.targets(mapTile);
      const city = this.cityAt(mapTile.x, mapTile.y);
      if (targets.length > 0 || city) this.showSquadActionsMenu(squad);
      else this.finishSquadActions(await this.getChara(squad.id));

      this.actionWindowContainer?.destroy();
    };

    this.moveToTile(squad.id, mapTile, callback);
  }

  private async endSquadTurn() {
    const aliveIds = this.getAliveSquadsFromForce(this.currentForce).map(
      (u) => u.id
    );
    const defeatedForces = this.getDefeatedForces();

    if (defeatedForces.includes(PLAYER_FORCE)) {
      alert(`Player loses!`);
    } else if (defeatedForces.includes(CPU_FORCE)) {
      alert(`Player wins!`);
    } else if (Set(aliveIds).equals(this.movedSquads)) {
      // TODO: move this to own event
      this.endTurn();
    } else if (this.currentForce === CPU_FORCE) {
      await this.delay(500);
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

    await this.delay(100);

    const chara = await this.getChara(target);

    chara.fadeOut(() => {
      this.scene.remove(chara.scene.key);

      this.state.mapSquads = this.state.mapSquads.map((s) =>
        s.id === target ? { ...s, status: "defeated" } : s
      );

      this.movedSquads = this.movedSquads.filter((id) => id !== target);
    });
  }

  private selectCity(id: string) {
    this.setSelectedCity(id);
    this.refreshUI();
    const { x, y } = this.cityIO(id);

    this.signal("selectCity", [
      { type: "MOVE_CAMERA_TO", x, y, duration: 500 },
    ]);
  }

  private highlightCell(cmd: { type: "HIGHLIGHT_CELL"; pos: Vector }) {
    const { x, y } = cmd.pos;
    const mapTile = this.tileAt(x, y);

    this.cellHighlight?.destroy();
    this.cellHighlight = this.add.rectangle(
      mapTile.tile.x,
      mapTile.tile.y,
      cellSize,
      cellSize
    );

    this.cellHighlight.setStrokeStyle(2, 0x1a65ac);
    this.mapContainer.add(this.cellHighlight);
  }

  updateState(state: MapState) {
    this.state = state;
  }

  create(data: MapCommands[]) {
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

    this.signal("startup", data);

    renderMap(this);
    this.renderStructures();

    renderSquads(this);
    this.refreshUI();

    this.makeWorldDraggable();
    this.setWorldBounds();

    this.startForceTurn();
    // if (!this.hasShownVictoryCondition) {
    //   this.showVictoryCondition();
    //   this.hasShownVictoryCondition = true;
    // }
  }

  tween(options: any) {
    return new Promise<void>((resolve) =>
      this.tweens.add({
        ...options,
        onComplete: resolve,
      })
    );
  }
  delay(delay: number) {
    return new Promise<void>((resolve) =>
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

    return new Promise<void>((resolve) =>
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

  makeCellsInteractive() {
    this.clearAllTileEvents();
    this.tiles.forEach((tile) => this.makeInteractive(tile));
  }
  getSelectedUnit() {
    if (this.selectedEntity && this.selectedEntity.type === "unit") {
      return this.getUnit(this.selectedEntity.id);
    }
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on("pointerup", (pointer: Pointer) => {
      if (!this.cellClickDisabled)
        this.signal("regular click cell", [
          { type: "CLICK_CELL", cell },
          { type: "HIGHLIGHT_CELL", pos: cell },
        ]);

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
    });
  }
  clearAllTileTint() {
    this.tiles.forEach((tile) => {
      tile.tile.clearTint();
      this.tweens.killTweensOf(tile.tile);
      tile.tile.alpha = 1;
    });
  }

  getCellPositionOnScreen({ x, y }: { x: number; y: number }) {
    const pos = this.getPos({ x, y });

    return { ...pos, y: pos.y + CHARA_VERTICAL_OFFSET };
  }

  clickSquad(unit: MapSquad) {
    this.moveCameraTo(unit.pos, 500);
    if (unit.force === PLAYER_FORCE) {
      this.handleClickOnOwnUnit(unit);
    } else {
      this.handleClickOnEnemyUnit(unit);
    }
  }

  showClickableCellsForUnit(squad: MapSquad) {
    this.clearTiles();

    squad.validSteps.forEach((cell) =>
      this.tintClickableCells(this.tileAt(cell.target.x, cell.target.y))
    );
    this.highlightAttackableCells(squad);
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
    return this.charas.find((c) => c.key === this.charaKey(unitId));
  }

  charaKey(squadId: string) {
    return `unit-${squadId}`;
  }

  handleClickOnOwnUnit(squad: MapSquad) {
    if (this.movedSquads.includes(squad.id))
      this.signal("click on moved unit", [
        { type: "CLEAR_TILES" },
        { type: "SHOW_SQUAD_PANEL", unit: squad },
      ]);
    else {
      this.signal("click on non moved unit", [
        { type: "CLEAR_TILES" },
        { type: "SHOW_SQUAD_PANEL", unit: squad },
        { type: "SHOW_TARGETABLE_CELLS", unit: squad },
      ]);
      this.makeCellAttackable(squad);
    }
  }

  async handleClickOnEnemyUnit(enemyUnit: MapSquad) {
    const selectedUnit = this.getSelectedUnit();

    if (!selectedUnit) {
      this.signal("click on enemy unit, noone was selected", [
        { type: "SHOW_SQUAD_PANEL", unit: enemyUnit },
      ]);
    } else {
      let action = (selectedUnit: MapSquad, chara_: Chara) => {
        const isInRange =
          selectedUnit.enemiesInRange
            .map((e) => e.enemy)
            .indexOf(enemyUnit.id) > -1;

        if (
          selectedUnit.force === PLAYER_FORCE &&
          isInRange &&
          !this.movedSquads.includes(selectedUnit.id)
        ) {
          this.showEnemyUnitMenu(enemyUnit, chara_, selectedUnit);
          this.signal(
            "click on enemy unit, enemy is in range of selected ally that can attack",
            [
              { type: "CLEAR_TILES" },
              { type: "SHOW_TARGETABLE_CELLS", unit: selectedUnit },
            ]
          );
        } else {
          this.signal(
            "click on unit, either: not player turn, not in range or selected ally has moved",
            [{ type: "SHOW_SQUAD_PANEL", unit: enemyUnit }]
          );
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

  async showEnemyUnitMenu(
    enemySquad: MapSquad,
    enemyChara: Chara,
    selectedAlly: MapSquad
  ) {
    this.closeActionWindow();
    this.disableInput();

    await this.moveCameraTo(selectedAlly.pos, 500);

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

            this.signal("view enemy", [
              { type: "CLEAR_TILES" },
              { type: "CLOSE_ACTION_PANEL" },
            ]);
          },
        },
        {
          title: "Cancel",
          action: () => {
            this.signal("view enemy", [{ type: "CLOSE_ACTION_PANEL" }]);
          },
        },
      ]
    );
  }
  attack = (starter: MapSquad, target: MapSquad) => {
    this.turnOff();

    const isPlayer = starter.force === PLAYER_FORCE;

    const combatCallback = (cmds: MapCommands[]) => {
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
        .filter((v) => v.every((n) => n === 0))
        .keySeq()
        .map((target) => ({ type: "DESTROY_TEAM", target }))
        .toJS();

      this.scene.start(
        "MapScene",
        cmds.concat(defeated).concat([{ type: "END_SQUAD_TURN" }])
      );
    };

    this.scene.transition({
      target: "CombatScene",
      duration: 0,
      moveBelow: true,
      data: {
        squads: this.state.mapSquads,
        units: this.state.units,
        top: isPlayer ? target.id : starter.id,
        bottom: isPlayer ? starter.id : target.id,
        onCombatFinish: combatCallback,
      },
    });
  };

  async moveToEnemyUnit(enemySquad: MapSquad, selectedAlly: MapSquad) {
    const enemy = selectedAlly.enemiesInRange.find(
      (e) => e.enemy === enemySquad.id
    );

    if (!enemy) throw new Error(INVALID_STATE);

    this.movedSquads.push(selectedAlly.id);

    const chara = await this.getChara(selectedAlly.id);
    await this.moveUnit(chara, enemy.steps);

    this.attack(selectedAlly, enemySquad);
  }
  turnOff() {
    this.selectedEntity = null;
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

  tintClickableCells(cell: MapTile) {
    cell.tile.setTint(WALKABLE_CELL_TINT);
  }

  async destroyUI() {
    const { uiContainer } = this.getContainers();

    uiContainer.removeAll(true);
  }

  async refreshUI() {
    const { container, uiContainer } = this.getContainers();

    this.destroyUI();

    panel(
      BOTTOM_PANEL_X,
      BOTTOM_PANEL_Y,
      BOTTOM_PANEL_WIDTH,
      BOTTOM_PANEL_HEIGHT,
      uiContainer,
      this
    );

    //UNIT INFORMATION
    if (this.selectedEntity && this.selectedEntity.type === "unit") {
      this.selectedSquadInfo(uiContainer);

      //CITY INFORMATION
    } else if (this.selectedEntity && this.selectedEntity.type === "city") {
      this.selectedCityInfo(uiContainer);
    }

    this.returnToTitleButton(uiContainer, container);

    // Squad List (Left Navbar)
    this.playerSquadList(uiContainer);

    if (this.currentForce === PLAYER_FORCE)
      button(1150, 650, "End Turn", uiContainer, this, () => {
        this.endTurn();
      });
  }

  private selectedCityInfo(uiContainer: Phaser.GameObjects.Container) {
    const city = this.cityIO(this.selectedEntity.id);

    text(20, 610, city.name, uiContainer, this);
    if (city.force)
      text(
        1000,
        610,
        `Controlled by ${this.getForce(city.force).name}`,
        uiContainer,
        this
      );
  }

  private selectedSquadInfo(uiContainer: Phaser.GameObjects.Container) {
    const squad = this.squadIO(this.selectedEntity.id);

    text(20, 610, squad.name, uiContainer, this);
    text(1000, 610, `${squad.range} cells`, uiContainer, this);

    button(200, 620, "Squad Details", this.uiContainer, this, () =>
      this.viewSquadDetails(squad.id)
    );
  }

  viewSquadDetails(id: string): void {
    const squad = this.getSquad(id);
    this.disableInput();
    squadDetails(
      this,
      squad,
      this.state.units
        .toList()
        .filter((u) => Object.keys(squad.members).includes(u.id))
        .toJS(),
      () => this.enableInput()
    );
  }

  private playerSquadList(uiContainer: Phaser.GameObjects.Container) {
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
                this.signal("clicked dispatched squad list button", [
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
      this.signal("opened dispatch squad list", [
        { type: "CLEAR_TILES_TINTING" },
        { type: "CLEAR_TILES_EVENTS" },
      ]);
      this.disableInput();
      this.renderDispatchWindow();
    });
  }

  private returnToTitleButton(
    uiContainer: Phaser.GameObjects.Container,
    container: Phaser.GameObjects.Container
  ) {
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
  }

  renderDispatchWindow() {
    let container = this.add.container();
    panel(100, 100, 500, 500, container, this);

    let x = 120;
    let y = 120;

    button(500, 120, "Close", container, this, () => {
      container.destroy();
      this.enableInput();
    });

    let currentSquads = Set(this.getPlayerSquads().map((s) => s.id));

    // TODO: avoid listing defeated squads
    let squadsToRender = Object.values(getSquads()).filter(
      (sqd) => !currentSquads.has(sqd.id)
    );

    squadsToRender.forEach((sqd, i) => {
      button(x, y + 70 * i, sqd.name, container, this, async () => {
        this.dispatchSquad(sqd);
        container.destroy();
        this.refreshUI();
        this.enableInput();

        await this.delay(100);

        let squad = this.squadIO(sqd.id);
        this.signal("clicked dispatch squad button", [
          { type: "CLICK_SQUAD", unit: squad },
          {
            type: "MOVE_CAMERA_TO",
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
      getCity(force.initialPosition, this.state)
    );

    this.state.mapSquads.push(mapSquad);
    force.squads.push(squad.id);

    // TODO: make this a pipeline instead of a side effect
    this.getValidMoves();
    // TODO: add "summon" effect
    renderSquad(this, mapSquad);
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
    this.movedSquads = [];

    if (force.id === CPU_FORCE) {
      this.disableInput();
      await this.delay(300);
      this.runAi();
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
    this.getValidMoves();

    const remainingUnits = this.getAliveSquadsFromForce(CPU_FORCE).filter(
      (u) => !this.movedSquads.includes(u.id)
    );

    const [currentSquad] = remainingUnits;
    if (!currentSquad) {
      this.switchForce();
      this.startForceTurn();
      return;
    }

    let aiMode = this.state.ai.get(currentSquad.id);

    if (aiMode === "DEFEND") {
      this.movedSquads.push(currentSquad.id);

      this.signal("finish ai squad turn (defend)", [
        { type: "END_SQUAD_TURN" },
      ]);
      return;
    }

    this.moveCameraTo(currentSquad.pos, 200);
    this.setSelectedUnit(currentSquad.id);
    this.refreshUI();

    const enemyInRange = currentSquad.enemiesInRange[0];

    if (enemyInRange) {
      const enemySquad = this.squadIO(enemyInRange.enemy);
      this.moveToEnemyUnit(enemySquad, currentSquad);
    } else {
      const { x, y } = (currentSquad.validSteps.first() as ValidStep).steps[1];

      const tile = this.getTileAt(x, y);

      this.moveToTile(currentSquad.id, tile, () => {
        this.signal("finish ai turn, no enemy in range", [
          { type: "END_SQUAD_TURN" },
        ]);
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
    const bg = this.add.image(centerX, centerY, "announce_bg");
    const forceName = force.id === PLAYER_FORCE ? "Player" : "Enemy";
    const title = this.add.text(centerX, centerY, `${forceName} Turn`, {
      fontSize: 36,
    });
    title.setOrigin(0.5);

    return new Promise<void>((resolve) => {
      const timeline = this.tweens.createTimeline({
        onComplete: () => resolve(),
      });
      timeline.add({
        targets: [title, bg],
        alpha: 1,
        duration: 500,
      });
      timeline.add({
        targets: [title, bg],
        alpha: 0,
        duration: 1200,
      });
      timeline.play();
      timeline.on("complete", () => {
        console.log("complete!!");
        title.destroy();
        bg.destroy();
      });
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
    this.enableInput();
  }

  // TODO: refactor, all action menus should start here
  showCellMenu(squad: MapSquad, mapTile: MapTile) {
    if (this.movedSquads.includes(squad.id)) return;

    const { x, y, tile } = mapTile;

    this.dragDisabled = true;

    this.signal("opening cell menu", [
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
              this.signal("clicked Move in cell menu", [
                { type: "CLOSE_ACTION_PANEL" },
                { type: "CLEAR_TILES" },
                { type: "MOVE_SQUAD", mapTile, squad },
              ]);
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
              this.signal("clicked city on cell menu", [
                { type: "SELECT_CITY", id: maybeCity.id },
              ]);
            },
          },
        ];
      } else return [];
    };

    const cancelAction = [
      {
        title: "Cancel",
        action: () => {
          this.dragDisabled = false;
          this.signal("clicked cancel on cell menu", [
            { type: "CLOSE_ACTION_PANEL" },
            { type: "SHOW_TARGETABLE_CELLS", unit: squad },
          ]);
        },
      },
    ];

    const windowX = tile.x + this.mapX;
    const windowY = tile.y + this.mapY;

    this.actionWindow(
      windowX,
      windowY,
      moveAction().concat(viewCityAction()).concat(cancelAction)
    );
  }

  showCityInfo(id: string) {
    this.state.cities.find((c) => c.id === id);

    const pic = this.add.sprite(SCREEN_WIDTH / 2, 350, "merano");
    pic.setOrigin(0.5);
    pic.setDisplaySize(250, 250);
    this.label(SCREEN_WIDTH / 2, 520, "Merano Castle");
  }

  actionWindow(x: number, y: number, actions: ActionWindowAction[]) {
    this.dragDisabled = true;
    if (this.actionWindowContainer) this.actionWindowContainer.destroy();
    this.actionWindowContainer = this.add.container(x, y);
    actions.map(({ title, action }, index) => {
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

    // Move unit to tile
    const chara = this.charas.find((c) => c.key === this.charaKey(squadId));
    const force = this.getCurrentForce();

    if (!chara || !force) throw new Error(INVALID_STATE);

    this.tiles.forEach((tile) =>
      walkableTiles.includes(tile.type) ? tile.tile.clearTint() : null
    );

    this.clearTiles();

    this.movedSquads.push(squadId);

    const mapSquad = this.squadIO(squadId);
    const step = mapSquad.validSteps.find((step) =>
      Map(step.target).equals(Map({ x, y }))
    );

    if (!step) throw new Error(INVALID_STATE);

    this.moveUnit(chara, step.steps).then(() => {
      const city = this.cityAt(x, y);
      if (city && city.force !== mapSquad.force)
        this.signal("unit moved to enemy city, capturing", [
          { type: "CAPTURE_CITY", id: city.id, force: mapSquad.force },
        ]);

      this.signal("unit moved, update position", [
        { type: "UPDATE_SQUAD_POS", id: squadId, pos: { x, y } },
      ]);

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

  async showActionMenu({
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

    this.disableCellClick();

    await this.moveCameraTo(cell, 500);

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
        this.signal("will choose unit to attack, close action window", [
          { type: "CLOSE_ACTION_PANEL" },
        ]);
        this.highlightAttackableCells(squad);
        this.makeCellAttackable(squad);
      },
      onWait: () => {
        this.signal("waited, close action window and stop actions", [
          { type: "CLOSE_ACTION_PANEL" },
        ]);
        this.finishSquadActions(chara);
        //this.checkTurnEnd();
      },
    });
  }

  finishSquadActions(chara: Chara) {
    chara.container.setAlpha(0.5);

    this.signal("finish squad actions", [{ type: "END_SQUAD_TURN" }]);
  }

  async makeCellAttackable(playerSquad: MapSquad) {
    const enemies = this.targets(playerSquad.pos);
    enemies.forEach(async (e) => {
      const enemyChara = await this.getChara(e.id);
      const enemySquad = this.getSquad(e.id);
      const tile = this.getTileAt(enemySquad.pos.x, enemySquad.pos.y);

      tile.tile.removeAllListeners();
      tile.tile.on("pointerup", () =>
        this.actionWindow(
          tile.tile.x + this.mapX || 0,
          tile.tile.y + this.mapY || 0,
          [
            {
              title: "Attack Squad",
              action: async () => {
                await this.attackEnemySquad(playerSquad, enemyChara, e);

                //TODO: add transition
              },
            },
            {
              title: "View",
              action: async () => {
                this.signal("view enemy squad details", [
                  { type: "VIEW_SQUAD_DETAILS", id: e.id },
                ]);
              },
            },

            {
              title: "Cancel",
              action: () => {
                this.signal("close window that showed enemy squad options", [
                  { type: "CLOSE_ACTION_PANEL" },
                ]);
              },
            },
          ]
        )
      );
    });
  }

  private async attackEnemySquad(
    playerSquad: MapSquad,
    enemyChara: Chara,
    e: MapSquad
  ) {
    const baseX = 200;
    const baseY = 200;
    const scale = 0.5;

    this.disableInput();
    this.destroyUI();
    this.closeActionWindow();

    const leader = this.getSelectedSquadLeader(playerSquad.id);

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
                this.clearAllTileTint();
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
            this.signal("chose squad in cell menu", [
              { type: "CLEAR_TILES" },
              { type: "CLICK_SQUAD", unit: sqd },
            ]);
          },
        }))
      )
      .concat(
        city
          ? [
              {
                title: `City - ${city.name}`,
                action: () => {
                  this.signal("chose city in cell menu", [
                    { type: "CITY_CLICK", id: city.id },
                    { type: "CLOSE_ACTION_PANEL" },
                    { type: "CLEAR_TILES" },
                  ]);
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

  disableInput() {
    this.clearAllTileEvents();
    this.disableCellClick();
    this.disableCityClick();
    this.dragDisabled = true;
  }

  enableInput() {
    this.dragDisabled = false;
    this.enableCellClick();
    this.enableCityClick();
    this.makeCellsInteractive();
    this.refreshUI();
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
