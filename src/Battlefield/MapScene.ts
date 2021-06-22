import { Chara } from "../Chara/Model";
import { Container, Image } from "../Models";
import {
  Vector,
  MapSquad,
  MapState,
  MapTile,
} from "./Model";
import { Map, Set } from "immutable";
import renderMap from "./board/renderMap";
import renderSquads from "./board/renderSquads";
import renderStructures from "./board/renderStructures";
import { VectorRec } from "./makeVector";
import { delay } from "../Scenes/utils";
import { fadeIn } from "../UI/Transition";
import { MapCommands } from "./MapCommands";
import { Mode, DEFAULT_MODE } from "./Mode";
import preload from "./preload";
import { GAME_SPEED } from "../env";
import destroySquad from "./events/destroySquad";
import { makeWorldDraggable, setWorldBounds } from "./dragging";
import { enableInput } from "./board/input";
import pushSquad from "./squads/pushSquad";
import update from "./update";
import subscribe from "./subscribe";
import signal from "./signal";
import { refreshUI } from "./ui";

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

    refreshUI(this);
    this.game.events.emit("MapSceneCreated", this);
  }

}
