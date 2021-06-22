import { Chara } from "../Chara/Model";
import { Container, Image } from "../Models";
import { Vector, MapSquad, MapState, MapTile } from "./Model";
import { Map, Set } from "immutable";
import { VectorRec } from "./makeVector";
import { MapCommands } from "./MapCommands";
import { Mode, DEFAULT_MODE } from "./Mode";
import preload from "./preload";
import update from "./update";
import create from "./create";

export class MapScene extends Phaser.Scene {
  isPaused = false;
  squadsInMovement: Map<string, { path: Vector[]; squad: MapSquad }> = Map();

  tiles: MapTile[] = [];
  moveableCells: Set<VectorRec> = Set();
  walkableGrid: number[][] = [[]];
  tileIndex: MapTile[][] = [[]];
  citySprites: Image[] = [];
  mode: Mode = DEFAULT_MODE;

  state = {
    id: "",
    name: "",
    author: "",
    description: "",
    cells: [[]],
    charas: [],
    forces: [],
    cities: [],
    mapContainer: {} as Container,
    missionContainer: {} as Container,
    uiContainer: {} as Container,
    squads: Map(),
    units: Map(),
    timeOfDay: 0,
    tick: 0,
    ai: Map(),
    /** Contains the ids from all dispatched squads (from all forces). Should this move to the force? */
    dispatchedSquads: Set(),
  } as MapState;

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

  create(data: MapCommands[]) {
    create(this, data);
  }
}
