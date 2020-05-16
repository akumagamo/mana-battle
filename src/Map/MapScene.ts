import * as Phaser from 'phaser';
import {Chara} from '../Chara/Chara';
import {getSquad, getSquadLeader} from '../DB';
import {INVALID_STATE} from '../errors';
import button from '../UI/button';
import {Container, Image} from '../Models';
import * as easyStar from 'easystarjs';
import panel from '../UI/panel';
import text from '../UI/text';
import {identity} from '../utils/functional';

const PLAYER_FORCE = '0';
const WALKABLE_CELL_TINT = 0x99ff99;
const SQUAD_MOVE_RANGE = 3;
const SQUAD_MOVE_DURATION = 500;
const CHARA_MAP_SCALE = 0.5;
const CHARA_VERTICAL_OFFSET = -10;

const BOTTOM_PANEL_X = 0;
const BOTTOM_PANEL_Y = 600;
const BOTTOM_PANEL_WIDTH = 1280;
const BOTTOM_PANEL_HEIGHT = 120;

const easystar = new easyStar.js();

const cellSize = 100;

const boardPadding = 50;

// 0-> grass
// 5-> mountain1
// 6-> mountain2
// 7
// 8
// 3-> woods
//

const walkableTiles = [10];

const Map: MapBoard = {
  cells: [
    [10, 11, 10, 10, 10, 10, 10, 10, 27, 22, 22, 22, 22],
    [10, 11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11],
    [10, 11, 10, 10, 10, 10, 10, 24, 20, 25, 10, 10, 11],
    [10, 10, 10, 10, 10, 10, 10, 23, 11, 21, 10, 10, 11],
    [10, 11, 10, 10, 10, 10, 10, 27, 22, 26, 10, 10, 11],
    [11, 11, 11, 11, 11, 10, 10, 10, 10, 10, 10, 11, 11],
  ],
  forces: [
    {
      id: PLAYER_FORCE,
      name: 'Player',
      squads: [{id: '0', x: 0, y: 0, moves: 5, remainingMoves: 5}],
    },
    {
      id: '1',
      name: 'CPU',
      squads: [
        {id: '1', x: 0, y: 3, moves: 5, remainingMoves: 5},
        {id: '2', x: 3, y: 1, moves: 5, remainingMoves: 5},
      ],
    },
  ],

  cities: [
    {id: 'a1', name: 'Arabella', x: 1, y: 1, force: PLAYER_FORCE},

    {id: 'm1', name: 'Marqueze', x: 3, y: 1, force: '1'},
  ],
};
type Coordinate = {x: number; y: number};
type MapBoard = {
  cells: number[][];
  forces: MapForce[];
  cities: MapCity[];
};
type MapForce = {id: string; name: string; squads: MapSquad[]};
type MapSquad = {
  id: string;
  x: number;
  y: number;
  moves: number;
  remainingMoves: number;
};
type MapCity = {
  id: string;
  name: string;
  x: number;
  y: number;
  force: string | null;
};

type MapTile = {
  x: number;
  y: number;
  type: number;
  tile: Image;
  distance: number;
};
export class MapScene extends Phaser.Scene {
  squads: Chara[] = [];

  tiles: MapTile[] = [];
  selectedSquad: string | null = null;
  currentForce: string = PLAYER_FORCE;

  getForce(id: string) {
    const force = Map.forces.find((force) => force.id === id);
    if (!force) throw new Error(INVALID_STATE);
    return force;
  }
  getForceSquad(force: MapForce, id: string) {
    const squad = force.squads.find((f) => f.id === id);

    if (!squad) throw new Error(INVALID_STATE);

    return squad;
  }
  constructor() {
    super('MapScene');
  }

  getPos(x: number, y: number) {
    return {
      x: boardPadding + x * cellSize,
      y: boardPadding + y * cellSize,
    };
  }

  renderMap(container: Container, uiContainer: Container) {
    console.log(`MapScene - renderMap`);

    Map.cells.forEach((arr, col) =>
      arr.forEach((n, row) => {
        const {x, y} = this.getPos(row, col);

        const makeTile = () => {
          //TODO: refactor, this is bad and ugly
          if (n === 10) return this.add.image(x, y, 'tiles/grass');
          else if (n === 11) return this.add.image(x, y, 'tiles/woods');
          else if (n === 20) return this.add.image(x, y, 'tiles/mountain1');
          else if (n === 21) return this.add.image(x, y, 'tiles/mountain2');
          else if (n === 22) return this.add.image(x, y, 'tiles/mountain3');
          else if (n === 23) return this.add.image(x, y, 'tiles/mountain4');
          else if (n === 24) return this.add.image(x, y, 'tiles/mountain5');
          else if (n === 25) return this.add.image(x, y, 'tiles/mountain6');
          else if (n === 26) return this.add.image(x, y, 'tiles/mountain7');
          else if (n === 27) return this.add.image(x, y, 'tiles/mountain8');
          else return this.add.image(x, y, 'tiles/grass');
        };

        const tile = makeTile();

        tile.setInteractive();

        container.add(tile);

        tile.displayWidth = cellSize;
        tile.displayHeight = cellSize;

        this.tiles.push({
          x: row,
          y: col,
          type: n,
          tile: tile,
          distance: 0,
        });
      }),
    );
  }
  makeInteractive(container: Container, uiContainer: Container, cell: MapTile) {
    cell.tile.on('pointerdown', () => {
      if (this.selectedSquad) {
        this.selectTile(container, uiContainer, this.selectedSquad, cell);
      }
    });
  }
  clearAllTileEvents() {
    this.tiles.forEach((tile) => tile.tile.removeAllListeners());
  }
  renderUnits(container: Container, uiContainer: Container) {
    console.log(`MapScene - renderUnits`);

    Map.forces.forEach((force) => {
      force.squads.forEach((sqd) =>
        this.renderSquad(force, container, uiContainer, sqd),
      );
    });
  }

  getCharaPosition({x, y}: {x: number; y: number}) {
    const pos = this.getPos(x, y);

    return {...pos, y: pos.y + CHARA_VERTICAL_OFFSET};
  }

  renderSquad(
    force: MapForce,
    container: Container,
    uiContainer: Container,
    squad: MapSquad,
  ) {
    const leader = getSquadLeader(squad.id);
    if (!leader) return;

    const {x, y} = this.getCharaPosition(squad);

    const chara = new Chara(
      'chara' + leader.id,
      this,
      leader,
      x,
      y,
      CHARA_MAP_SCALE,
      true,
    );

    if (chara.container) container.add(chara.container);

    this.squads.push(chara);

    chara.onClick((c: Chara) => {
      if (!c.unit.squad) throw new Error(INVALID_STATE);
      const sqd = this.getForceSquad(
        this.getForce(this.currentForce),
        c.unit.squad,
      );

      if (force.id === PLAYER_FORCE) {
        this.selectedSquad = c.unit.squad;

        if (sqd.remainingMoves < 1) {
          console.info('No move points remaining for', sqd);
          return;
        }

        const range = sqd.remainingMoves;

        const cells = this.tilesInRange(sqd.x, sqd.y, range + 2)
          .filter((tile) => walkableTiles.includes(tile.type))
          .filter((tile) => !this.isEnemyInTile(tile))
          .filter((tile) => tile.x !== sqd.x || tile.y !== sqd.y);

        cells.forEach((cell) => {
          this.findPath(sqd, cell).then((path) => {
            if (path && path.length <= range + 1) {
              cell.tile.setTint(WALKABLE_CELL_TINT);
              cell.distance = path.length - 1;
              this.makeInteractive(container, uiContainer, cell);
            }
          });
        });

        this.refreshUI(container, uiContainer);
      } else {
        Map.forces
          .filter((force) => force.id === PLAYER_FORCE)
          .forEach((force) =>
            force.squads
              .filter((force) => force.id === this.selectedSquad)
              .forEach((playerSquad) => {
                const distance = this.getDistance(playerSquad, sqd);

                if (distance === 1) {
                  console.log(`attack!!`, sqd);

                  this.scene.transition({
                    target: 'CombatScene',
                    duration: 0,
                    moveBelow: true,
                    data: {
                      top: chara.unit.squad,
                      bottom: this.selectedSquad,
                    },
                  });
                }
              }),
          );
      }
    });
  }

  refreshUI(container: Container, uiContainer: Container) {
    this.renderUI(container, uiContainer);
  }

  renderUI(container: Container, uiContainer: Container) {
    console.log(`MapScene - renderUI`);

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

    if (this.selectedSquad) {
      const force = this.getForce(this.currentForce);

      const squad = getSquad(this.selectedSquad);
      const forceSquad = this.getForceSquad(force, this.selectedSquad);

      text(20, 610, squad.name, uiContainer, this);

      text(1000, 610, `${forceSquad.remainingMoves} moves`, uiContainer, this);
    }

    button(1100, 50, 'Return to Title', uiContainer, this, () => {
      container.removeAll();
      this.squads.forEach((c) => this.scene.remove(c.scene.key));
      this.squads = [];
      this.tiles = [];

      this.scene.transition({
        target: 'TitleScene',
        duration: 0,
        moveBelow: true,
      });
    });
  }
  create() {
    console.log(`MapScene - create`);
    const container = this.add.container(0, 0);
    const uiContainer = this.add.container(0, 0);
    this.renderMap(container, uiContainer);
    this.renderUnits(container, uiContainer);
    this.renderUI(container, uiContainer);

    this.runTurn();
  }

  runTurn() {
    const force = this.getForce(this.currentForce);

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

    this.refreshMoves(force);
  }

  refreshMoves(force: MapForce) {
    const updatedSquads = force.squads.map((squad) => ({
      ...squad,
      remainingMoves: squad.moves,
    }));

    Map.forces = Map.forces.map((f) =>
      f.id === force.id ? {...f, squads: updatedSquads} : f,
    );
  }

  tilesInRange(x: number, y: number, range: number) {
    return this.tiles.filter((tile) => this.getDistance({x, y}, tile) <= range);
  }

  getDistance(source: Coordinate, target: Coordinate) {
    return Math.abs(target.x - source.x) + Math.abs(target.y - source.y);
  }

  selectTile(
    container: Container,
    uiContainer: Container,
    unitId: string,
    {x, y, distance}: MapTile,
  ) {
    console.log(`MapScene - selectTile`);
    const chara = this.squads.find((c) => c.unit.id === unitId);
    const force = Map.forces.find((force) => force.id === PLAYER_FORCE);

    if (!chara || !force) throw new Error(INVALID_STATE);

    const squad = force.squads.find((squad) => squad.id === chara.unit.squad);

    if (!squad) throw new Error(INVALID_STATE);

    this.tiles.forEach((tile) =>
      walkableTiles.includes(tile.type) ? tile.tile.clearTint() : null,
    );

    this.findPath(squad, {x, y}).then((path) => this.moveUnit(chara, path));

    // FIXME: local state mutation
    squad.x = x;
    squad.y = y;

    squad.remainingMoves = squad.remainingMoves - distance;
    this.refreshUI(container, uiContainer);
    this.clearAllTileEvents();
  }

  moveUnit = (chara: Chara, path: Coordinate[]) => {
    const endCallback = () => {
      path.forEach((p) => this.getTileAt(p.x, p.y).tile.clearTint());
    };
    const tweens = path
      .filter((_, index) => index > 0)
      .map((pos, index) => {
        const target = this.getCharaPosition(pos);
        return {
          targets: chara.container,
          x: target.x,
          y: target.y,
          duration: SQUAD_MOVE_DURATION,
          ease: 'Cubic',
          onComplete: index === path.length - 2 ? endCallback() : null,
        };
      });

    this.tweens.timeline({tweens});
  };

  isEnemyInTile(tile: Coordinate) {
    const enemies = this.getEnemies();

    return enemies.some((enemy) => enemy.x === tile.x && enemy.y === tile.y);
  }

  getEnemies() {
    return Map.forces
      .filter((force) => force.id !== PLAYER_FORCE)
      .map((force) => force.squads)
      .flat();
  }

  findPath = (
    origin: Coordinate,
    target: Coordinate,
  ): Promise<Coordinate[]> => {
    let cells = Map.cells.map((row) => row.map(identity));

    const enemies = this.getEnemies();

    enemies.forEach((sqd) => {
      cells[sqd.y][sqd.x] = 1;
    });

    easystar.setGrid(cells);
    easystar.setAcceptableTiles(walkableTiles);

    return new Promise((resolve) => {
      easystar.findPath(origin.x, origin.y, target.x, target.y, (path) => {
        resolve(path);
      });
      easystar.calculate();
    });
  };
  getTileAt(x: number, y: number) {
    const tile = this.tiles.find((tile) => tile.x === x && tile.y === y);

    if (!tile) throw new Error(INVALID_STATE);

    return tile;
  }
}
