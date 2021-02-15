import * as Phaser from "phaser";
import { Chara } from "../Chara/Chara";
import { INVALID_STATE } from "../errors";
import button from "../UI/button";
import { Container, Image, Pointer } from "../Models";
import panel from "../UI/panel";
import { squadsFromForce as getSquadsFromForce, getPathTo } from "./api";
import { Vector, MapSquad, MapState, Force, City } from "./Model";
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PLAYER_FORCE,
  CPU_FORCE,
  PUBLIC_URL,
} from "../constants";
import { toMapSquad } from "../Unit/Model";
import { Map, Set } from "immutable";
import speech from "../UI/speech";
import StaticBoardScene from "../Board/StaticBoardScene";
import clickCell from "./board/clickCell";
import renderMap from "./board/renderMap";
import renderSquads, { renderSquad } from "./board/renderSquads";
import renderStructures from "./board/renderStructures";
import entityInfo from "./entityInfo";
import squadDetails from "./effects/squadDetails";
import { Index, makeSquad, SquadRecord } from "../Squad/Model";
import { makeVector, VectorRec } from "./makeVector";
import announcement from "../UI/announcement";
import { delay, tween } from "../Scenes/utils";
import { fadeIn, fadeOut } from "../UI/Transition";
import { getDistance } from "../utils";
import { MapCommands } from "./MapCommands";
import { Mode, DEFAULT_MODE } from "./Mode";

const WALKABLE_CELL_TINT = 0x88aa88;
const ENEMY_IN_CELL_TINT = 0xff2222;

const SPEED = 1;

const SQUAD_MOVE_DURATION = 200 / SPEED;
const CHARA_VERTICAL_OFFSET = -10;

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

export const startMapScene = async (
  parent: Phaser.Scene,
  cmds: MapCommands[]
) =>
  new Promise<void>((resolve) => {
    const scene = new MapScene(resolve);

    parent.scene.add("MapScene", scene, true, cmds);
  });

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

  state = {} as MapState;

  currentForce: string = PLAYER_FORCE;
  inactiveSquads: Set<string> = Set();

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

  cellHighlight: Phaser.GameObjects.Rectangle | null = null;

  squadsToRemove: Set<string> = Set();

  constructor(public resolve: () => void) {
    super("MapScene");
  }

  preload() {
    const mp3s = ["map1"];
    mp3s.forEach((id: string) => {
      this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`);
    });
    const tiles = [
      "tiles/grass",
      "tiles/woods",
      "tiles/mountain",
      "tiles/castle",
      "tiles/water",
      "tiles/beach-r",
      "tiles/beach-l",
      "tiles/beach-t",
      "tiles/beach-b",
      "tiles/beach-tr",
      "tiles/beach-tl",
      "tiles/beach-br",
      "tiles/beach-bl",

      "tiles/beach-b-and-r",
      "tiles/beach-t-and-r",
      "tiles/beach-b-and-l",
      "tiles/beach-t-and-l",
    ];
    tiles.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
    });

    const structures = ["tiles/town"];
    structures.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
    });
    const mapElems = ["ally_emblem", "enemy_emblem"];
    mapElems.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/map/${id}.svg`);
    });

    // merano - Alois_Kirnig_-_Forst_Castle_on_the_Adige_near_Merano

    const castles = ["merano"];
    castles.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/art/castles/${id}.jpg`);
    });

    this.load.once("complete", () => {
      this.resolve();
    });
  }

  signal(eventName: string, cmds: MapCommands[]) {
    console.log(`💁 ::: SIGNAL ::: ${eventName}`, cmds);
    cmds.forEach(async (cmd) => {
      console.time(cmd.type);
      if (cmd.type === "DESTROY_TEAM") {
        this.markSquadForRemoval(cmd.target);
      } else if (cmd.type === "UPDATE_STATE") {
        this.updateState(cmd.target);
      } else if (cmd.type === "UPDATE_SQUAD_POS") {
        this.state.squads = this.state.squads.map((squad) =>
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
      } else if (cmd.type === "MOVE_CAMERA_TO") {
        this.moveCameraTo({ x: cmd.x, y: cmd.y }, cmd.duration);
      } else if (cmd.type === "CLEAR_TILES") {
        this.clearTiles();
      } else if (cmd.type === "CLEAR_TILES_EVENTS") {
        this.clearAllTileEvents();
      } else if (cmd.type === "CLEAR_TILES_TINTING") {
        this.clearAllTileTint();
      } else if (cmd.type === "SHOW_TARGETABLE_CELLS") {
        this.showClickableCellsForUnit(cmd.unit);
      } else if (cmd.type === "HIGHLIGHT_CELL") {
        this.highlightCell(cmd);
      } else if (cmd.type === "VIEW_SQUAD_DETAILS") {
        this.viewSquadDetails(cmd.id);
      } else if (cmd.type === "REFRESH_UI") {
        this.refreshUI();
      } else if (cmd.type === "END_SQUAD_TURN") {
        await this.endSquadTurn(cmd.id);
      } else if (cmd.type === "RUN_TURN") {
        this.startForceTurn();
      } else if (cmd.type === "CITY_CLICK") {
        this.selectCity(cmd.id);
      } else if (cmd.type === "CAPTURE_CITY") {
        this.captureCity(cmd);
      } else if (cmd.type === "END_FORCE_TURN") {
        this.switchForce();
      }

      console.timeEnd(cmd.type);
    });

    console.log(`🙅 ::: finish signal ${eventName}`);
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

  private async endSquadTurn(id: string) {
    this.inactiveSquads = this.inactiveSquads.add(id);

    const chara = await this.getChara(id);
    chara.container.setAlpha(0.5);

    this.clearAllTileTint();

    if (this.getSquad(id).squad.force === PLAYER_FORCE)
      this.changeMode({ type: "SQUAD_SELECTED", id });

    const forceSquadsIds = Set(
      getSquadsFromForce(this.state)(this.currentForce).map((u) => u.id)
    );
    const defeatedForces = this.getDefeatedForces();

    if (defeatedForces.has(PLAYER_FORCE)) {
      await announcement(this, "Defeat");
      await fadeOut(this);
      this.scene.start("TitleScene");
      this.turnOff();
    } else if (defeatedForces.includes(CPU_FORCE)) {
      await announcement(this, "Victory");
      await fadeOut(this);
      this.scene.start("TitleScene");
      this.turnOff();
    } else if (forceSquadsIds.equals(this.inactiveSquads)) {
      this.signal("all squads performed actions, switching", [
        { type: "END_FORCE_TURN" },
      ]);
    } else if (this.currentForce === CPU_FORCE) {
      await this.runAi();
    } else {
      console.log(`=== PLAYER ===`);
    }
  }

  private markSquadForRemoval(id: string) {
    this.squadsToRemove = this.squadsToRemove.add(id);
  }
  private async destroySquad(id: string) {
    const chara = await this.getChara(id);

    await chara.fadeOut();

    await this.removeSquadFromState(id);
  }

  async selectCity(id: string) {
    this.refreshUI();
    const { x, y } = await this.getCity(id);

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

    this.cellHighlight.setStrokeStyle(8, 0x1a65ac);
    this.mapContainer.add(this.cellHighlight);
  }

  updateState(state: MapState) {
    this.state = state;
  }

  async create(data: MapCommands[]) {
    if (process.env.NODE_ENV !== "production") {
      //@ts-ignore
      window.mapScene = this;

      //@ts-ignore
      window.clickCell = (x, y) => clickCell(this, { x, y });
    }

    this.sound.stopAll();
    const music = this.sound.add("map1");

    //@ts-ignore
    music.setVolume(0.3);
    music.play();

    this.mapContainer = this.add.container(this.mapX, this.mapY);
    this.uiContainer = this.add.container();
    this.missionContainer = this.add.container();

    this.signal("startup", data);

    await delay(this, 100);

    renderMap(this);
    renderStructures(this);
    renderSquads(this);

    await fadeIn(this);

    this.makeWorldDraggable();
    this.setWorldBounds();

    await Promise.all(this.squadsToRemove.map((id) => this.destroySquad(id)));
    this.squadsToRemove = Set();

    this.startForceTurn();
    // if (!this.hasShownVictoryCondition) {
    //   victoryCondition(this);
    //   this.hasShownVictoryCondition = true;
    // }
  }

  async removeSquadFromState(id: string) {
    this.state.forces = this.state.forces.map((force) => ({
      ...force,
      squads: force.squads.filter((s) => s !== id),
    }));

    const squadId = this.state.squads.find((s) => s.id === id).id;

    this.inactiveSquads = this.inactiveSquads.remove(id);
    this.state.dispatchedSquads = this.state.dispatchedSquads.remove(id);

    this.state.squads = this.state.squads.filter((s) => s.id !== id);
    this.state.units = this.state.units.filter((u) => u.squad !== squadId);

    const chara = await this.getChara(id);
    chara.container.destroy();
    this.scene.remove(chara.scene.key);

    this.charas = this.charas.filter((c) => c.unit.squad !== id);
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

    return new Promise<void>((resolve) => {
      this.tweens.add({
        targets: this.mapContainer,
        x: tx(),
        y: ty(),
        duration: duration,
        ease: "cubic.out",
        onComplete: () => {
          resolve();
        },
      });

      this.tweens.add({
        targets: this,
        mapX: tx(),
        mapY: ty(),
        duration: duration,
        ease: "cubic.out",
      });
    });
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
      color: "#fff",
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

    this.input.on("dragend", async (pointer: Pointer) => {
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

  async getForce(id: string) {
    return this.state.forces.find((f) => f.id === id);
  }

  getCity = async (id: string): Promise<City> => {
    return this.state.cities.find((c) => c.id === id);
  };

  getDefeatedForces(): Set<string> {
    return this.state.forces
      .map((f) => f.id)
      .reduce((xs, x) => {
        const squads = this.state.squads.filter((u) => u.squad.force === x);

        if (squads.size < 1) return xs.add(x);
        else return xs;
      }, Set() as Set<string>);
  }

  getPos({ x, y }: Vector) {
    return {
      x: boardPadding + x * cellSize,
      y: boardPadding + y * cellSize,
    };
  }

  renderStructures() {}

  // TODO: call this only once, and control on/off with boolean
  // as this takes 150ms to run
  makeCellsInteractive() {
    this.clearAllTileEvents();
    this.tiles.forEach((tile) => this.makeInteractive(tile));
  }
  getSelectedSquad() {
    if (
      this.mode.type === "SQUAD_SELECTED" ||
      this.mode.type === "MOVING_SQUAD" ||
      this.mode.type === "SELECTING_ATTACK_TARGET"
    )
      return this.getSquad(this.mode.id);
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on("pointerup", async (pointer: Pointer) => {
      if (!this.cellClickDisabled)
        this.signal("regular click cell", [
          { type: "CLICK_CELL", cell },
          { type: "HIGHLIGHT_CELL", pos: cell },
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

  getCellPositionOnScreen({ x, y }: { x: number; y: number }) {
    const pos = this.getPos({ x, y });

    return { ...pos, y: pos.y + CHARA_VERTICAL_OFFSET };
  }

  async clickSquad(squad: MapSquad) {
    await this.moveCameraTo(squad.pos, 100);

    this.signal("clicked on unit, marking cell as selected", [
      { type: "HIGHLIGHT_CELL", pos: squad.pos },
    ]);
    if (squad.squad.force === PLAYER_FORCE) {
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
        .map(makeVector)
    );

    let cells: Set<VectorRec> = Set();

    const getCells = ({ x, y }: { x: number; y: number }, distance: number) =>
      dirs.forEach(([xx, yy]) => {
        const vector = makeVector({ x: xx + x, y: yy + y });

        if (
          vector.x < 0 ||
          vector.y < 0 ||
          !walkableTiles.includes(this.tileAt(vector.x, vector.y).type) ||
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
      case "SELECTING_ATTACK_TARGET":
        const selectedUnit = this.getSquad(this.mode.id);
        if (getDistance(selectedUnit.pos, enemyUnit.pos) === 1) {
          this.attackEnemySquad(selectedUnit, enemyUnit);
        }
        break;
      default:
        this.changeMode({ type: "SQUAD_SELECTED", id: enemyUnit.id });
    }
  }

  attack = async (starter: MapSquad, target: MapSquad) => {
    await fadeOut(this);

    this.turnOff();

    const isPlayer = starter.squad.force === PLAYER_FORCE;

    const combatCallback = (cmds: MapCommands[]) => {
      let squads = cmds.reduce((xs, x) => {
        if (x.type === "UPDATE_UNIT") {
          let sqdId = x.unit.squad || "";

          if (!xs[sqdId]) {
            xs[sqdId] = 0;
          }

          xs[sqdId] += x.unit.currentHp;
        }

        return xs;
      }, {} as { [x: string]: number });

      let defeated = Map(squads)
        .filter((v) => v === 0)
        .keySeq()
        .map((target) => ({ type: "DESTROY_TEAM", target }))
        .toJS();

      this.scene.start(
        "MapScene",
        cmds.concat(defeated)
        //.concat([{type: 'END_SQUAD_TURN'}]),
      );
    };

    // URGENT TODO: type this scene integration
    // change this.state.squads to squadIndex
    this.scene.start("CombatScene", {
      squads: this.state.squads
        .filter((sqd) => [starter.id, target.id].includes(sqd.id))
        .reduce((xs, x) => xs.set(x.id, makeSquad(x.squad)), Map()) as Index,
      units: this.state.units.filter((u) =>
        [starter.id, target.id].includes(u.squad)
      ),
      // GOD mode
      // .map((u) =>
      //   u.id.startsWith("player")
      //     ? { ...u, str: 999, dex: 999, hp: 999, currentHp: 999 }
      //     : u
      // ),
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
    const { uiContainer } = this.getContainers();

    uiContainer.removeAll(true);
  }

  async refreshUI() {
    this.destroyUI();

    if (
      this.mode.type === "NOTHING_SELECTED" ||
      this.mode.type === "CHANGING_SQUAD_FORMATION"
    )
      return;

    const { uiContainer } = this.getContainers();

    entityInfo(this, uiContainer);

    this.returnToTitleButton();
  }

  viewSquadDetails(id: string): void {
    const mapSquad = this.getSquad(id);
    this.disableMapInput();
    squadDetails(
      this,
      mapSquad,
      this.state.units.filter((u) => mapSquad.squad.members.has(u.id)),
      () => this.enableInput()
    );
  }

  private returnToTitleButton() {
    button(1100, 50, "Return to Title", this.uiContainer, this, () => {
      this.turnOff();
      this.scene.start("TitleScene");
    });
  }

  getSquad(squadId: string) {
    return this.state.squads.find((s) => s.id === squadId);
  }
  squadAt(x: number, y: number) {
    return this.state.dispatchedSquads
      .map((id) => this.getSquad(id))
      .find((s) => s.pos.x === x && s.pos.y === y);
  }

  getSelectedSquadLeader(squadId: string) {
    let squad = this.getSquad(squadId);

    return this.state.units.get(squad.squad.leader);
  }

  getPlayerSquads() {
    return this.state.squads.filter((sqd) => sqd.squad.force === PLAYER_FORCE);
  }

  async dispatchSquad(squad: SquadRecord) {
    const force = await this.getForce(PLAYER_FORCE);
    let mapSquad = toMapSquad(squad, await this.getCity(force.initialPosition));

    this.state.dispatchedSquads = this.state.dispatchedSquads.add(squad.id);

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
    this.inactiveSquads = Set();
    this.charas.forEach((u) => u.container?.setAlpha(1)); // TODO: name this "restore"

    const force = this.state.forces.find(
      (force) => force.id !== this.currentForce
    );
    this.currentForce = force.id;

    await this.showTurnTitle(force);
    this.startForceTurn();
  }

  async startForceTurn() {
    const force = await this.getForce(this.currentForce);

    this.healUnits(force);

    if (force.id === CPU_FORCE) {
      this.disableMapInput();
      await this.runAi();
    } else {
      this.enableInput();
      const unit = this.state.squads.find(
        (u) => u.squad.force === PLAYER_FORCE
      );

      if (this.inactiveSquads.has(unit.id)) {
        return this.signal("squad has already moved, finishing its turn", [
          { type: "END_SQUAD_TURN", id: unit.id },
        ]);
      }

      this.clickSquad(unit);

      const squad = this.getPlayerSquads().get(0);
      this.changeMode({ type: "SQUAD_SELECTED", id: squad.id });
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
    Object.keys(squad.squad.members).forEach((unitId) => {
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
    return getSquadsFromForce(this.state)(forceId);
  }
  /**
   * @TODO: refactor to make this return a list of ai actions
   * its hard to debug by going into other methods
   */
  async runAi() {
    await delay(this, 500);
    const remainingUnits = getSquadsFromForce(this.state)(CPU_FORCE).filter(
      (u) => !this.inactiveSquads.includes(u.id)
    );

    const currentSquad = remainingUnits.first<MapSquad>();
    if (!remainingUnits.first()) {
      return await this.switchForce();
    }

    let aiMode = this.state.ai.get(currentSquad.id);

    if (aiMode === "DEFEND") {
      this.inactiveSquads = this.inactiveSquads.add(currentSquad.id);

      this.signal("finish ai squad turn (defend)", [
        { type: "END_SQUAD_TURN", id: currentSquad.id },
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
      // const {x, y} = (currentSquad.validSteps.first() as ValidStep).steps[1];
      // const tile = this.getTileAt(x, y);
      //await this.moveToTile(currentSquad.id, tile);
      // this.signal('finish ai turn, no enemy in range', [
      //   {type: 'END_SQUAD_TURN', id: currentSquad.id},
      // ]);
    }
  }

  async showTurnTitle(force: Force) {
    const forceName = force.id === PLAYER_FORCE ? "Player" : "Enemy";
    const message = `${forceName} Turn`;

    return await announcement(this, message);
  }

  clearTiles() {
    this.clearAllTileTint();

    //if (this.cellHighlight) this.cellHighlight.destroy();
    //  this.clearAllTileEvents();
  }

  showCityInfo(id: string) {
    this.state.cities.find((c) => c.id === id);

    const pic = this.add.sprite(SCREEN_WIDTH / 2, 350, "merano");
    pic.setOrigin(0.5);
    pic.setDisplaySize(250, 250);
    this.label(SCREEN_WIDTH / 2, 520, "Merano Castle");
  }

  selectNextAlly() {
    const squad = this.getPlayerSquads().find(
      (sqd) => !this.inactiveSquads.has(sqd.id)
    );

    if (squad) {
      this.signal("clicked next ally btn, selecting", [
        { type: "CLICK_SQUAD", unit: squad },
      ]);
    }
  }

  /**
   * Moves a squad alongside a path
   */
  async moveUnit(squadId: string, path: Vector[]) {
    const chara = await this.getChara(squadId);

    const [, ...tail] = path;
    const tweens = tail.map((pos) => {
      const { x, y } = this.getCellPositionOnScreen(pos);
      return {
        targets: chara.container,
        x,
        y,
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
    return this.state.squads.filter(
      (unit) => unit.squad.force !== this.currentForce
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
        (e) => e.pos.x + x === cell.x && e.pos.y + y === cell.y
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

    this.inactiveSquads = this.inactiveSquads.add(playerSquad.id);

    const bg = panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, this.uiContainer, this);
    bg.setAlpha(0.4);

    const leader = this.getSelectedSquadLeader(playerSquad.id);

    const enemyUnits = this.state.units.filter(
      (u) => u.squad === enemySquad.id
    );

    const enemy = new StaticBoardScene(
      enemySquad.squad,
      enemyUnits,
      baseX + 10,
      baseY + 5,
      scale,
      true
    );

    this.scene.add("enemy_board", enemy, true);

    const alliedUnits = this.state.units.filter(
      (u) => u.squad === playerSquad.id
    );

    const ally = new StaticBoardScene(
      playerSquad.squad,
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

    await delay(this, 3000);

    this.scene.remove(portrait.scene.key);

    ally.turnOff();
    enemy.turnOff();

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

    return cells.toJS().reduce((grid_, { x, y }) => {
      grid_[y][x] = 0;

      return grid_;
    }, grid);
  }

  async moveSquadTo(id: string, target: Vector) {
    const source = this.getSquad(id);

    const path = getPathTo(this.walkableGrid)(source.pos)(
      target
    ).map(([x, y]) => ({ x, y }));

    await this.moveUnit(id, path);
  }

  showMoveControls(squad: MapSquad) {
    this.changeMode({
      type: "MOVING_SQUAD",
      start: squad.pos,
      id: squad.squad.id,
    });
    this.signal('clicked on "show move controls" button', [
      { type: "SHOW_TARGETABLE_CELLS", unit: squad },
    ]);
  }
  showAttackControls(mapSquad: MapSquad) {
    this.changeMode({ type: "SELECTING_ATTACK_TARGET", id: mapSquad.squad.id });
    this.highlightAttackableCells(mapSquad);
  }
  changeMode(mode: Mode) {
    console.log("CHANGING MODE", mode);
    this.mode = mode;
    this.refreshUI();
  }
}
