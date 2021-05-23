import { Chara } from '../Chara/Chara';
import { INVALID_STATE } from '../errors';
import button from '../UI/button';
import { Container, Image, Pointer } from '../Models';
import panel from '../UI/panel';
import { squadsFromForce as getSquadsFromForce, getPathTo } from './api';
import { Vector, MapSquad, MapState, Force, City } from './Model';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  PLAYER_FORCE,
  PUBLIC_URL,
} from '../constants';
import { toMapSquad } from '../Unit/Model';
import { Map, Set } from 'immutable';
import speech from '../UI/speech';
import StaticBoardScene from '../Board/StaticBoardScene';
import clickCell from './board/clickCell';
import renderMap from './board/renderMap';
import renderSquads, { renderSquad } from './board/renderSquads';
import renderStructures from './board/renderStructures';
import ui from './ui';
import squadDetails from './effects/squadDetails';
import { Index, makeSquad, SquadRecord } from '../Squad/Model';
import { VectorRec } from './makeVector';
//import announcement from "../UI/announcement";
import { delay, tween } from '../Scenes/utils';
import { fadeIn, fadeOut } from '../UI/Transition';
import { MapCommands } from './MapCommands';
import { Mode, DEFAULT_MODE } from './Mode';
import { getDistance } from '../utils';
import { cellSize } from './config';
import { screenToCellPosition, cellToScreenPosition } from './board/position';

const WALKABLE_CELL_TINT = 0x88aa88;

const SPEED = 2;

const CHARA_VERTICAL_OFFSET = -10;

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
) => {
  const scene = new MapScene();

  parent.scene.add('MapScene', scene, true, cmds);
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

  cellHighlight: Phaser.GameObjects.Rectangle | null = null;

  squadsToRemove: Set<string> = Set();
  squadToPush: {
    winner: string;
    loser: string;
    direction: string;
  } | null = null;

  constructor() {
    super('MapScene');
  }

  preload() {
    const mp3s = ['map1'];
    mp3s.forEach((id: string) => {
      this.load.audio(id, `${PUBLIC_URL}/music/${id}.mp3`);
    });
    const tiles = [
      'tiles/grass',
      'tiles/woods',
      'tiles/mountain',
      'tiles/castle',
      'tiles/water',
      'tiles/beach-r',
      'tiles/beach-l',
      'tiles/beach-t',
      'tiles/beach-b',
      'tiles/beach-tr',
      'tiles/beach-tl',
      'tiles/beach-br',
      'tiles/beach-bl',

      'tiles/beach-b-and-r',
      'tiles/beach-t-and-r',
      'tiles/beach-b-and-l',
      'tiles/beach-t-and-l',
    ];
    tiles.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
    });

    const structures = ['tiles/town'];
    structures.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/${id}.svg`);
    });
    const mapElems = ['ally_emblem', 'enemy_emblem'];
    mapElems.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/map/${id}.svg`);
    });

    // merano - Alois_Kirnig_-_Forst_Castle_on_the_Adige_near_Merano

    const castles = ['merano'];
    castles.forEach((id: string) => {
      this.load.image(id, `${PUBLIC_URL}/art/castles/${id}.jpg`);
    });
  }

  update() {
    if (!this.isPaused) {
      this.moveSquads();
    }
  }

  private moveSquads() {
    const movedSquads = this.squadsInMovement.keySeq();

    let direction = '';

    this.squadsInMovement.forEach(async (value, squadId) => {
      const { path, squad } = value;

      const [head] = path;

      const next = cellToScreenPosition(head);

      const dist = getDistance(squad.pos, next);

      if (dist >= SPEED) {
        if (next.x > squad.pos.x) {
          squad.pos.x += 1 * SPEED;
          direction = 'right';
        } else if (next.x < squad.pos.x) {
          squad.pos.x -= 1 * SPEED;
          direction = 'left';
        } else if (next.y > squad.pos.y) {
          squad.pos.y += 1 * SPEED;
          direction = 'bottom';
        } else if (next.y < squad.pos.y) {
          squad.pos.y -= 1 * SPEED;
          direction = 'top';
        }
        const chara = await this.getChara(squadId);
        chara.container.setPosition(squad.pos.x, squad.pos.y);
        // TODO: update squad + add single source of "squad truth"
        this.updateState({
          ...this.state,
          squads: this.state.squads.setIn([squadId, 'pos'], squad.pos),
        });
      } else {
        console.log('arrived at checkpoint!');
        const [, ...remaining] = path;

        if (remaining.length > 0) {
          console.log(`removing checkpoint, as there are checkpoins remaining`);
          this.squadsInMovement = this.squadsInMovement.set(squadId, {
            path: remaining,
            squad,
          });
        } else {
          console.log('no checkpoints remaining, arrived at finale!');
          this.squadsInMovement = this.squadsInMovement.delete(squadId);
        }
      }

      return squadId;
    });

    // check collision
    // TODO: divide by each squad, store lists of enemies then compare
    movedSquads.forEach(async (sqd) => {
      const current = await this.getChara(sqd);

      // TODO: only enemies
      this.charas.forEach((c) => {
        if (c.key !== current.key) {
          const distance = getDistance(c.container, current.container);

          if (distance < 100) {
            this.isPaused = true;
            this.startCombat(
              this.getSquad(sqd),
              this.getSquad(c.unit.squad),
              direction
            );
          }
        }
      });
    });
  }

  signal(eventName: string, cmds: MapCommands[]) {
    console.log(`💁 ::: SIGNAL ::: ${eventName}`, cmds);
    cmds.forEach(async (cmd) => {
      console.time(cmd.type);
      if (cmd.type === 'DESTROY_TEAM') {
        this.markSquadForRemoval(cmd.target);
      } else if (cmd.type === 'UPDATE_STATE') {
        this.updateState(cmd.target);
      } else if (cmd.type === 'UPDATE_SQUAD_POS') {
        this.state.squads = this.state.squads.update(cmd.id, (sqd) => ({
          ...sqd,
          pos: cmd.pos,
        }));
      } else if (cmd.type === 'UPDATE_UNIT') {
        this.state.units = this.state.units.set(cmd.unit.id, cmd.unit);
      } else if (cmd.type === 'CLICK_CELL') {
        if (this.cellClickDisabled) {
          console.log(`Cell click disabled! Cancelling click`);
          return;
        }

        clickCell(this, cmd.cell);
      } else if (cmd.type === 'CLICK_SQUAD') {
        this.clickSquad(cmd.unit);
      } else if (cmd.type === 'MOVE_CAMERA_TO') {
        this.moveCameraTo({ x: cmd.x, y: cmd.y }, cmd.duration);
      } else if (cmd.type === 'CLEAR_TILES') {
        this.clearTiles();
      } else if (cmd.type === 'CLEAR_TILES_EVENTS') {
        this.clearAllTileEvents();
      } else if (cmd.type === 'CLEAR_TILES_TINTING') {
        this.clearAllTileTint();
      } else if (cmd.type === 'HIGHLIGHT_CELL') {
        this.highlightCell(cmd);
      } else if (cmd.type === 'VIEW_SQUAD_DETAILS') {
        this.viewSquadDetails(cmd.id);
      } else if (cmd.type === 'REFRESH_UI') {
        this.refreshUI();
      } else if (cmd.type === 'CITY_CLICK') {
        this.selectCity(cmd.id);
      } else if (cmd.type === 'CAPTURE_CITY') {
        this.captureCity(cmd);
      } else if (cmd.type === 'PUSH_SQUAD') {
        this.squadToPush = cmd;
      }

      console.timeEnd(cmd.type);
    });

    console.log(`🙅 ::: finish signal ${eventName}`);
  }

  private captureCity(cmd: {
    type: 'CAPTURE_CITY';
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
  private async destroySquad(id: string) {
    const chara = await this.getChara(id);

    await chara.fadeOut();

    await this.removeSquadFromState(id);
  }

  async selectCity(id: string) {
    this.refreshUI();
    const { x, y } = await this.getCity(id);

    this.signal('selectCity', [
      { type: 'MOVE_CAMERA_TO', x, y, duration: 500 },
    ]);
  }

  private highlightCell(cmd: { type: 'HIGHLIGHT_CELL'; pos: Vector }) {
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
    this.mode = DEFAULT_MODE;
    this.sound.stopAll();
    const music = this.sound.add('map1');

    //@ts-ignore
    music.setVolume(0.3);
    music.play();

    this.mapContainer = this.add.container(this.mapX, this.mapY);
    this.uiContainer = this.add.container();
    this.missionContainer = this.add.container();

    this.signal('startup', data);

    await delay(this, 100);

    renderMap(this);
    renderStructures(this);
    renderSquads(this);

    await fadeIn(this);

    this.makeWorldDraggable();
    this.setWorldBounds();

    await Promise.all(this.squadsToRemove.map((id) => this.destroySquad(id)));
    this.squadsToRemove = Set();

    // if (!this.hasShownVictoryCondition) {
    //   victoryCondition(this);
    //   this.hasShownVictoryCondition = true;
    // }

    await this.pushLoser();

    this.enableInput();
    this.isPaused = false;
  }

  async removeSquadFromState(id: string) {
    this.state.forces = this.state.forces.map((force) => ({
      ...force,
      squads: force.squads.filter((s) => s !== id),
    }));

    const squadId = this.state.squads.find((s) => s.id === id).id;

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
    let { x, y } = cellToScreenPosition(vec);

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
      x: { min: -1 * (rows * cellSize - SCREEN_WIDTH), max: 0 },
      y: { min: -1 * (cols * cellSize - SCREEN_HEIGHT), max: 0 },
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
      'drag',
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

  renderStructures() {}

  // TODO: call this only once, and control on/off with boolean
  // as this takes 150ms to run
  makeCellsInteractive() {
    this.clearAllTileEvents();
    this.tiles.forEach((tile) => this.makeInteractive(tile));
  }
  getSelectedSquad() {
    if (
      this.mode.type === 'SQUAD_SELECTED' ||
      this.mode.type === 'MOVING_SQUAD'
    )
      return this.getSquad(this.mode.id);
  }
  makeInteractive(cell: MapTile) {
    cell.tile.on('pointerup', async (pointer: Pointer) => {
      if (!this.cellClickDisabled)
        this.signal('regular click cell', [
          { type: 'CLICK_CELL', cell },
          { type: 'HIGHLIGHT_CELL', pos: cell },
        ]);

      await this.pingEffect(pointer);
    });
  }

  private async pingEffect(pointer: Phaser.Input.Pointer) {
    var ping = this.add.circle(pointer.upX, pointer.upY, 20, 0xffff66);

    await tween(this, {
      targets: ping,
      alpha: 0,
      duration: 500 / SPEED,
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

  async clickSquad(squad: MapSquad) {
    await this.moveCameraTo(squad.pos, 100);

    // this.signal('clicked on unit, marking cell as selected', [
    //   { type: 'HIGHLIGHT_CELL', pos: squad.pos },
    // ]);
    if (squad.squad.force === PLAYER_FORCE) {
      this.handleClickOnOwnUnit();
    } else {
      this.handleClickOnEnemyUnit(squad);
    }
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
    this.changeMode({ type: 'SQUAD_SELECTED', id: enemyUnit.id });
  }

  attack = async (starter: MapSquad, target: MapSquad, direction: string) => {
    await fadeOut(this);

    this.turnOff();

    const isPlayer = starter.squad.force === PLAYER_FORCE;

    // for now, player always wins
    const loser = target.id;

    const combatCallback = (cmds: MapCommands[]) => {
      let squadsTotalHP = cmds.reduce((xs, x) => {
        if (x.type === 'UPDATE_UNIT') {
          let sqdId = x.unit.squad || '';

          if (!xs[sqdId]) {
            xs[sqdId] = 0;
          }

          xs[sqdId] += x.unit.currentHp;
        }

        return xs;
      }, {} as { [x: string]: number });

      let commands = Map(squadsTotalHP)
        .filter((v) => v === 0)
        .keySeq()
        .map((target) => ({ type: 'DESTROY_TEAM', target }))
        .toJS()
        .concat([
          {
            type: 'PUSH_SQUAD',
            winner: starter.id,
            loser: loser,
            direction,
          },
        ]);

      this.scene.start(
        'MapScene',
        cmds.concat(commands)
        //.concat([{type: 'END_SQUAD_TURN'}]),
      );
    };

    // URGENT TODO: type this scene integration
    // change this.state.squads to squadIndex
    this.scene.start('CombatScene', {
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
      this.mode.type === 'NOTHING_SELECTED' ||
      this.mode.type === 'CHANGING_SQUAD_FORMATION'
    )
      return;

    const { uiContainer } = this.getContainers();

    ui(this, uiContainer);

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
    button(1100, 50, 'Return to Title', this.uiContainer, this, () => {
      this.turnOff();
      this.scene.start('TitleScene');
    });
  }

  getSquad(squadId: string) {
    return this.state.squads.get(squadId);
  }
  squadAt(x: number, y: number) {
    return this.state.dispatchedSquads
      .map((id) => this.getSquad(id))
      .find((s) => getDistance(cellToScreenPosition({ x, y }), s.pos) < 50);
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

  clearTiles() {
    this.clearAllTileTint();

    //if (this.cellHighlight) this.cellHighlight.destroy();
    //  this.clearAllTileEvents();
  }

  showCityInfo(id: string) {
    this.state.cities.find((c) => c.id === id);

    const pic = this.add.sprite(SCREEN_WIDTH / 2, 350, 'merano');
    pic.setOrigin(0.5);
    pic.setDisplaySize(250, 250);
    this.label(SCREEN_WIDTH / 2, 520, 'Merano Castle');
  }

  getTileAt(x: number, y: number) {
    const tile = this.tileIndex[y][x];

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }

  // TODO: handle scenario where none of the engaging squads belongs to the player
  async startCombat(squadA: MapSquad, squadB: MapSquad, direction: string) {
    const baseX = 200;
    const baseY = 200;
    const scale = 0.5;

    const playerSquad = [squadA, squadB].find(
      (sqd) => sqd.squad.force === PLAYER_FORCE
    );

    this.disableMapInput();
    this.destroyUI();

    const bg = panel(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, this.uiContainer, this);
    bg.setAlpha(0.4);

    const leader = this.getSelectedSquadLeader(playerSquad.id);

    const enemyUnits = this.state.units.filter((u) => u.squad === squadB.id);

    const enemy = new StaticBoardScene(
      squadB.squad,
      enemyUnits,
      baseX + 10,
      baseY + 5,
      scale,
      true
    );

    this.scene.add('enemy_board', enemy, true);

    const alliedUnits = this.state.units.filter((u) => u.squad === squadA.id);

    const ally = new StaticBoardScene(
      squadA.squad,
      alliedUnits,
      baseX + 200,
      baseY + 100,
      scale,
      false
    );

    this.scene.add('ally_board', ally, true);

    const { portrait } = speech(
      leader,
      450,
      70,
      'Ready for Combat',
      this.uiContainer,
      this
    );

    await delay(this, 3000);

    this.scene.remove(portrait.scene.key);

    ally.turnOff();
    enemy.turnOff();

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
    const source = this.getSquad(id);

    const grid = this.makeWalkableGrid();

    const startCell = screenToCellPosition(source.pos);
    const [, ...path] = getPathTo(grid)(startCell)(target).map(([x, y]) => ({
      x,
      y,
    }));
    const squad = this.getSquad(id);

    console.log(`path::`, path);
    this.squadsInMovement = this.squadsInMovement.set(id, {
      path,
      squad,
    });

    this.changeMode({ type: 'NOTHING_SELECTED' });
  }

  showMoveControls(squad: MapSquad) {
    this.changeMode({
      type: 'MOVING_SQUAD',
      start: squad.pos,
      id: squad.squad.id,
    });
  }

  changeMode(mode: Mode) {
    console.log('CHANGING MODE', mode);
    this.mode = mode;
    this.refreshUI();
  }

  async pushLoser() {
    if (this.squadToPush) {
      const loser = this.getSquad(this.squadToPush.loser);

      const { direction } = this.squadToPush;
      const dist = cellSize;
      let xPush = 0;
      let yPush = 0;
      if (direction === 'left') xPush = dist * -1;
      if (direction === 'right') xPush = dist;
      if (direction === 'top') yPush = dist * -1;
      if (direction === 'bottom') yPush = dist;

      const chara = await this.getChara(loser.id);

      const newPos = {
        x: chara.container.x + xPush,
        y: chara.container.y + yPush,
      };

      console.log(`NEWPOS::`, newPos);

      return new Promise((resolve) => {
        this.add.tween({
          targets: chara.container,
          duration: 1000,
          x: newPos.x,
          y: newPos.y,
          onComplete: () => {
            this.squadToPush = null;
            this.updateState({
              ...this.state,
              squads: this.state.squads.setIn([loser.id, 'pos'], newPos),
            });
            resolve();
          },
        });
      }) as Promise<void>;
    } else return Promise.resolve();
  }
}
