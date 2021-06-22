import { Chara } from "../Chara/Model";
import { Container, Image, Pointer } from "../Models";
import {
  Vector,
  MapSquad,
  MapState,
  getCity,
  getForce,
  getMapSquad,
  MapTile,
} from "./Model";
import { PLAYER_FORCE } from "../constants";
import { toMapSquad } from "../Unit/Model";
import { Map, Set } from "immutable";
import renderMap from "./board/renderMap";
import renderSquads, { renderSquad } from "./board/renderSquads";
import renderStructures from "./board/renderStructures";
import ui from "./ui";
import squadDetails from "./effects/squadDetails";
import { SquadRecord } from "../Squad/Model";
import { VectorRec } from "./makeVector";
import { delay, tween } from "../Scenes/utils";
import { fadeIn } from "../UI/Transition";
import { MapCommands } from "./MapCommands";
import { Mode, DEFAULT_MODE } from "./Mode";
import { getDistance } from "../utils";
import { WALKABLE_CELL_TINT } from "./config";
import { cellToScreenPosition } from "./board/position";
import CellClicked from "./events/CellClicked";
import preload from "./preload";
import { GAME_SPEED } from "../env";
import destroySquad from "./events/destroySquad";
import { makeWorldDraggable, setWorldBounds } from "./dragging";
import { disableMapInput, enableInput } from "./board/input";
import pushSquad from "./squads/pushSquad";
import update from "./update";
import subscribe from "./subscribe";
import signal from "./signal";

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
    update(this);
  }


  async create(data: MapCommands[]) {
    subscribe(this);

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

    signal(this, "startup", data);

    await delay(this, 100);

    renderMap(this);
    renderStructures(this);
    renderSquads(this);

    await fadeIn(this, 1000 / GAME_SPEED);

    makeWorldDraggable(this);
    setWorldBounds(this);

    await Promise.all(this.squadsToRemove.map((id) => destroySquad(this, id)));
    this.squadsToRemove = Set();

    // if (!this.hasShownVictoryCondition) {
    //   victoryCondition(this);
    //   this.hasShownVictoryCondition = true;
    // }

    await pushSquad(this);

    enableInput(this);
    this.isPaused = false;

    this.refreshUI();
    this.game.events.emit("MapSceneCreated", this);
  }

  // ------ Internals ----------------

  getSelectedSquad() {
    if (
      this.mode.type === "SQUAD_SELECTED" ||
      this.mode.type === "MOVING_SQUAD"
    )
      return getMapSquad(this.state, this.mode.id);
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on("pointerup", (pointer: Pointer) =>
      CellClicked(this).emit({
        scene: this,
        tile: cell,
        pointer: { x: pointer.upX, y: pointer.upY },
      })
    );
  }
  async handleCellClick({ tile, pointer }: { tile: Vector; pointer: Vector }) {
    if (!this.cellClickDisabled)
      signal(this, "regular click cell", [{ type: "CLICK_CELL", cell: tile }]);

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

  async getChara(squadId: string) {
    const leader = this.getSquadLeader(squadId);
    return this.charas.find((c) => c.id === leader.id);
  }

  tintClickableCells(cell: MapTile) {
    cell.tile.setTint(WALKABLE_CELL_TINT);
  }

  async destroyUI() {
    const { uiContainer } = this;

    uiContainer.removeAll(true);
  }

  async refreshUI() {
    this.destroyUI();

    if (this.mode.type === "CHANGING_SQUAD_FORMATION") return;

    const { uiContainer } = this;

    ui(this, uiContainer);
  }

  viewSquadDetails(id: string): void {
    const mapSquad = getMapSquad(this.state, id);
    disableMapInput(this);
    squadDetails(
      this,
      mapSquad,
      this.state.units.filter((u) => mapSquad.squad.members.has(u.id)),
      () => enableInput(this)
    );
  }

  squadAt(x: number, y: number) {
    return this.state.dispatchedSquads
      .map((id) => getMapSquad(this.state, id))
      .find((s) => getDistance(cellToScreenPosition({ x, y }), s.pos) < 50);
  }

  getSquadLeader(squadId: string) {
    let squad = getMapSquad(this.state, squadId);

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

  changeMode(mode: Mode) {
    this.mode = mode;
    this.refreshUI();
  }
}
