import { Chara } from "../Chara/Model";
import { INVALID_STATE } from "../errors";
import { Container, Image, Pointer } from "../Models";
import panel from "../UI/panel";
import { getPathTo } from "./api";
import {
  Vector,
  MapSquad,
  MapState,
  getCity,
  getForce,
  getForceSquads,
  getSquadUnits,
} from "./Model";
import { SCREEN_WIDTH, SCREEN_HEIGHT, PLAYER_FORCE } from "../constants";
import { toMapSquad, Unit } from "../Unit/Model";
import { Map, Set, List } from "immutable";
import speech from "../UI/speech";
import clickCell from "./board/clickCell";
import renderMap from "./board/renderMap";
import renderSquads, { renderSquad } from "./board/renderSquads";
import renderStructures from "./board/renderStructures";
import ui from "./ui";
import squadDetails from "./effects/squadDetails";
import { Index, createSquad, SquadRecord } from "../Squad/Model";
import { VectorRec } from "./makeVector";
import { delay, tween } from "../Scenes/utils";
import { fadeIn, fadeOut } from "../UI/Transition";
import { MapCommands } from "./MapCommands";
import { Mode, DEFAULT_MODE } from "./Mode";
import { getDistance } from "../utils";
import { cellSize, CHARA_VERTICAL_OFFSET, WALKABLE_CELL_TINT } from "./config";
import { screenToCellPosition, cellToScreenPosition } from "./board/position";
import * as CombatScene from "../Combat/CombatScene";
import { handleMovePlayerSquadButtonClicked } from "./ui/playerSquad";
import { organizeButtonClicked } from "./ui/organizeButtonClicked";
import dispatchWindow from "./dispatchWindow";
import returnButtonClicked from "../Squad/ListSquadsScene/events/returnButtonClicked";
import createStaticBoard from "../Board/createBoard";
import { healSquads } from "./events/healSquadsTick";
import CellClicked from "./events/CellClicked";
import ReturnedFromCombat from "./events/ReturnedFromCombat";
import CombatInitiated from "./events/CombatInitiated";
import events from "./events";
import preload from "./preload";
import moveSquads from "./update/moveSquads";
import { GAME_SPEED } from "../env";
import destroySquad from "./events/destroySquad";
import moveCameraTo from "./rendering/moveCameraTo";

export type MapTile = {
  x: number;
  y: number;
  type: number;
  tile: Image;
};

export const startMapScene = async (
  parent: Phaser.Scene,
  cmds: MapCommands[]
) => {
  parent.scene.manager.run("MapScene", cmds);
};

export class MapScene extends Phaser.Scene {
  isPaused = false;
  squadsInMovement: Map<string, { path: Vector[]; squad: MapSquad }> = Map();

  // TODO: use a map
  charas: Chara[] = [];
  tiles: MapTile[] = [];
  moveableCells: Set<VectorRec> = Set();
  walkableGrid: number[][] = [[]];
  tileIndex: MapTile[][] = [[]];
  citySprites: Image[] = [];
  mode: Mode = DEFAULT_MODE;

  // Containers can't be created in the constructor, so we are casting the types here
  // TODO: consider receiving containers from parent or pass them around in functions
  // or use separated scenes
  mapContainer = {} as Container;
  missionContainer = {} as Container;
  uiContainer = {} as Container;

  state = {} as MapState;

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

  squadsToRemove: Set<string> = Set();
  squadToPush: {
    winner: string;
    loser: string;
    direction: string;
  } | null = null;

  constructor() {
    super("MapScene");
  }

  preload = preload;

  update() {
    if (!this.isPaused) {
      moveSquads(this);

      this.state.timeOfDay += 1;
      this.state.tick += 1;

      if (this.state.tick === 100) {
        healSquads(this.state);
        this.state.tick = 0;
      }
    }
  }

  handleCloseSquadArrivedInfoMessage(chara: Chara) {
    chara.destroy();
    this.refreshUI();
    this.isPaused = false;
  }

  async signal(_eventName: string, cmds: MapCommands[]) {
    await Promise.all(
      cmds.map(async (cmd) => {
        if (cmd.type === "DESTROY_TEAM") {
          this.markSquadForRemoval(cmd.target);
        } else if (cmd.type === "UPDATE_STATE") {
          this.updateState(cmd.target);
        } else if (cmd.type === "UPDATE_SQUAD_POS") {
          this.state.squads = this.state.squads.update(cmd.id, (sqd) => ({
            ...sqd,
            pos: cmd.pos,
          }));
        } else if (cmd.type === "UPDATE_UNIT") {
          this.state.units = this.state.units.set(cmd.unit.id, cmd.unit);
        } else if (cmd.type === "CLICK_CELL") {
          if (this.cellClickDisabled) {
            return;
          }

          clickCell(this, cmd.cell);
        } else if (cmd.type === "MOVE_CAMERA_TO") {
          moveCameraTo(this, { x: cmd.x, y: cmd.y }, cmd.duration);
        } else if (cmd.type === "CLEAR_TILES") {
          this.clearTiles();
        } else if (cmd.type === "CLEAR_TILES_EVENTS") {
          this.clearAllTileEvents();
        } else if (cmd.type === "CLEAR_TILES_TINTING") {
          this.clearAllTileTint();
        } else if (cmd.type === "VIEW_SQUAD_DETAILS") {
          this.viewSquadDetails(cmd.id);
        } else if (cmd.type === "REFRESH_UI") {
          this.refreshUI();
        } else if (cmd.type === "CITY_CLICK") {
          this.selectCity(cmd.id);
        } else if (cmd.type === "CAPTURE_CITY") {
          this.captureCity(cmd);
        } else if (cmd.type === "PUSH_SQUAD") {
          this.squadToPush = cmd;
        }
      })
    );
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

  private markSquadForRemoval(id: string) {
    this.squadsToRemove = this.squadsToRemove.add(id);
  }

  async selectCity(id: string) {
    this.refreshUI();
    const { x, y } = getCity(this.state, id);

    this.signal("selectCity", [
      { type: "MOVE_CAMERA_TO", x, y, duration: 500 },
    ]);
  }

  updateState(state: MapState) {
    this.state = { ...this.state, ...state };
  }

  async create(data: MapCommands[]) {
    events.CellClicked(this).on(this.handleCellClick.bind(this));
    events
      .MovePlayerSquadButonClicked(this)
      .on(handleMovePlayerSquadButtonClicked);
    events
      .SquadArrivedInfoMessageCompleted(this)
      .on(this.handleCloseSquadArrivedInfoMessage.bind(this));
    events.OrganizeButtonClicked(this).on(() =>
      organizeButtonClicked(
        {
          turnOff: this.turnOff.bind(this),
          state: this.state,
          scene: this.scene,
        },
        (listScene) => returnButtonClicked(this)(listScene)
      )
    );

    this.mode = DEFAULT_MODE;

    if (process.env.SOUND_ENABLED) {
      this.sound.stopAll();
      const music = this.sound.add("map1");

      //@ts-ignore
      music.setVolume(0.3);
      music.play();
    }

    this.mapContainer = this.add.container(this.mapX, this.mapY);
    this.uiContainer = this.add.container();
    this.missionContainer = this.add.container();

    this.signal("startup", data);

    await delay(this, 100);

    renderMap(this);
    renderStructures(this);
    renderSquads(this);

    await fadeIn(this, 1000 / GAME_SPEED);

    this.makeWorldDraggable();
    this.setWorldBounds();

    await Promise.all(this.squadsToRemove.map((id) => destroySquad(this, id)));
    this.squadsToRemove = Set();

    // if (!this.hasShownVictoryCondition) {
    //   victoryCondition(this);
    //   this.hasShownVictoryCondition = true;
    // }

    await this.pushLoser();

    this.enableInput();
    this.isPaused = false;

    this.refreshUI();
    this.game.events.emit("MapSceneCreated", this);
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

  getDefeatedForces(): Set<string> {
    return this.state.forces
      .map((f) => f.id)
      .reduce((xs, x) => {
        const squads = this.state.squads.filter((u) => u.squad.force === x);

        if (squads.size < 1) return xs.add(x);
        else return xs;
      }, Set() as Set<string>);
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
      this.mode.type === "MOVING_SQUAD"
    )
      return this.getMapSquad(this.mode.id);
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on("pointerup", (pointer: Pointer) =>
      CellClicked(this).emit({
        tile: cell,
        pointer: { x: pointer.upX, y: pointer.upY },
      })
    );
  }
  async handleCellClick({ tile, pointer }: { tile: Vector; pointer: Vector }) {
    if (!this.cellClickDisabled)
      this.signal("regular click cell", [{ type: "CLICK_CELL", cell: tile }]);

    this.pingEffect(pointer);
  }

  private async pingEffect(pointer: Vector) {
    var ping = this.add.circle(pointer.x, pointer.y, 20, 0xffff66);

    await tween(this, {
      targets: ping,
      alpha: 0,
      duration: 500 / GAME_SPEED,
      scale: 2,
      onComplete: () => ping.destroy(),
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
    const pos = cellToScreenPosition({ x, y });

    return { ...pos, y: pos.y + CHARA_VERTICAL_OFFSET };
  }

  async getChara(squadId: string) {
    const leader = this.getSquadLeader(squadId);
    return this.charas.find((c) => c.id === leader.id);
  }

  attack = async (starter: MapSquad, target: MapSquad, direction: string) => {
    await fadeOut(this, 1000 / GAME_SPEED);

    this.turnOff();

    const isPlayer = starter.squad.force === PLAYER_FORCE;

    // for now, player always wins
    const loser = target.id;

    const combatCallback = (units: List<Unit>) => {
      let squadsTotalHP = units.reduce((xs, unit) => {
        let sqdId = unit.squad || "";

        if (!xs[sqdId]) {
          xs[sqdId] = 0;
        }

        xs[sqdId] += unit.currentHp;

        return xs;
      }, {} as { [x: string]: number });

      const updateUnits = units.map((unit) => ({ type: "UPDATE_UNIT", unit }));

      let commands = Map(squadsTotalHP)
        .filter((v) => v === 0)
        .keySeq()
        .map((target) => ({ type: "DESTROY_TEAM", target }))
        .concat(updateUnits)
        .toJS()
        .concat([
          {
            type: "PUSH_SQUAD",
            winner: starter.id,
            loser: loser,
            direction,
          },
        ]);

      // TODO: use safe start
      this.scene.start("MapScene", units.concat(commands));

      ReturnedFromCombat(this).emit(null);
    };

    // URGENT TODO: type this scene integration
    // change this.state.squads to squadIndex
    CombatScene.start(this, {
      squads: this.state.squads
        .filter((sqd) => [starter.id, target.id].includes(sqd.id))
        .reduce((xs, x) => xs.set(x.id, createSquad(x.squad)), Map()) as Index,
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

    CombatInitiated(this).emit(null);
  };

  turnOff() {
    this.mapContainer.destroy();
    this.uiContainer.destroy();
    this.charas.forEach((chara) => chara.destroy());
    this.charas = [];
    this.tiles.forEach((tile) => {
      tile.tile.destroy();
    });
    this.tiles = [];
    this.tileIndex = [[]];

    this.mode = DEFAULT_MODE;

    this.scene.manager.stop("MapScene");

    Object.keys(events).forEach((k) => this.events.off(k));
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

    if (this.mode.type === "CHANGING_SQUAD_FORMATION") return;

    const { uiContainer } = this.getContainers();

    ui(this, uiContainer);
  }

  viewSquadDetails(id: string): void {
    const mapSquad = this.getMapSquad(id);
    this.disableMapInput();
    squadDetails(
      this,
      mapSquad,
      this.state.units.filter((u) => mapSquad.squad.members.has(u.id)),
      () => this.enableInput()
    );
  }

  getMapSquad(squadId: string) {
    return this.state.squads.get(squadId);
  }
  squadAt(x: number, y: number) {
    return this.state.dispatchedSquads
      .map((id) => this.getMapSquad(id))
      .find((s) => getDistance(cellToScreenPosition({ x, y }), s.pos) < 50);
  }

  getSquadLeader(squadId: string) {
    let squad = this.getMapSquad(squadId);

    return this.state.units.get(squad.squad.leader);
  }

  getPlayerSquads() {
    return this.state.squads.filter((sqd) => sqd.squad.force === PLAYER_FORCE);
  }

  async dispatchSquad(squad: SquadRecord, dispatchTime: number) {
    const force = getForce(this.state, PLAYER_FORCE);
    let mapSquad = toMapSquad(
      squad,
      getCity(this.state, force.initialPosition),
      dispatchTime
    );

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

  getAliveSquadsFromForce(forceId: string) {
    return getForceSquads(this.state, forceId);
  }

  clearTiles() {
    this.clearAllTileTint();
  }

  showCityInfo(id: string) {
    this.state.cities.find((c) => c.id === id);

    const pic = this.add.sprite(SCREEN_WIDTH / 2, 350, "merano");
    pic.setOrigin(0.5);
    pic.setDisplaySize(250, 250);
    this.label(SCREEN_WIDTH / 2, 520, "Merano Castle");
  }

  getTileAt(x: number, y: number) {
    const tile = this.tileIndex[y][x];

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }

  // TODO: handle scenario where none of the engaging squads belongs to the player
  async startCombat(squadA: MapSquad, squadB: MapSquad, direction: string) {
    const baseX = 500;
    const baseY = 300;
    const scale = 0.5;

    const playerSquad = [squadA, squadB].find(
      (sqd) => sqd.squad.force === PLAYER_FORCE
    );

    this.disableMapInput();
    this.destroyUI();

    const bg = panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, this.uiContainer, this);
    bg.setAlpha(0.4);

    const leader = this.getSquadLeader(playerSquad.id);

    const enemyUnits = getSquadUnits(this.state, squadB.id);

    const { board: enemy } = createStaticBoard(
      this,
      squadB.squad,
      enemyUnits,
      baseX + 10,
      baseY + 5,
      scale,
      true
    );

    const alliedUnits = this.state.units.filter((u) => u.squad === squadA.id);

    const { board: ally } = createStaticBoard(
      this,
      squadA.squad,
      alliedUnits,
      baseX + 200,
      baseY + 100,
      scale,
      false
    );

    const { portrait } = await speech(
      leader,
      450,
      70,
      "Ready for Combat",
      this.uiContainer,
      this,
      GAME_SPEED
    );

    await delay(this, 3000 / GAME_SPEED);

    portrait.destroy();

    ally.destroy();
    enemy.destroy();

    this.attack(squadA, squadB, direction);
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

  makeWalkableGrid(): number[][] {
    return this.state.cells.map((c) =>
      c.map((cell) => {
        if (cell === 3) return 1;
        // 3 => Water
        else return 0;
      })
    );
  }

  async moveSquadTo(id: string, target: Vector) {
    const source = this.getMapSquad(id);

    const grid = this.makeWalkableGrid();

    const startCell = screenToCellPosition(source.pos);
    const [, ...path] = getPathTo(grid)(startCell)(target).map(([x, y]) => ({
      x,
      y,
    }));

    const squad = this.getMapSquad(id);

    this.squadsInMovement = this.squadsInMovement.set(id, {
      path,
      squad,
    });

    this.changeMode({ type: "SQUAD_SELECTED", id });
  }

  showMoveControls(squad: MapSquad) {
    this.changeMode({
      type: "MOVING_SQUAD",
      start: squad.pos,
      id: squad.squad.id,
    });
  }

  changeMode(mode: Mode) {
    this.mode = mode;
    this.refreshUI();
  }

  async pushLoser() {
    if (this.squadToPush) {
      const loser = this.getMapSquad(this.squadToPush.loser);

      const { direction } = this.squadToPush;
      const dist = cellSize;
      let xPush = 0;
      let yPush = 0;
      if (direction === "left") xPush = dist * -1;
      if (direction === "right") xPush = dist;
      if (direction === "top") yPush = dist * -1;
      if (direction === "bottom") yPush = dist;

      const chara = await this.getChara(loser.id);

      const newPos = {
        x: chara.container.x + xPush,
        y: chara.container.y + yPush,
      };

      return new Promise((resolve) => {
        this.add.tween({
          targets: chara.container,
          duration: 1000 / GAME_SPEED,
          x: newPos.x,
          y: newPos.y,
          onComplete: () => {
            this.squadToPush = null;
            this.updateState({
              ...this.state,
              squads: this.state.squads.setIn([loser.id, "pos"], newPos),
            });
            resolve();
          },
        });
      }) as Promise<void>;
    } else return Promise.resolve();
  }
  handleDispatchClick() {
    this.disableMapInput();
    this.isPaused = true;
    dispatchWindow(this);
  }
}
