import { Chara } from '../Chara/Model';
import { SquadRecord } from '../Squad/Model';
import { Unit, UnitIndex } from '../Unit/Model';
import makeUnitsDragable from './makeUnitsDragable';
import { Board } from './Model';
import createTiles from './placeTiles';
import placeUnits from './placeUnits';

export default (
  scene: Phaser.Scene,
  squad: SquadRecord,
  units: UnitIndex,
  x: number,
  y: number,
  scale = 1,
  front = true,
  isSelected = false,
  interactive?: {
    onSquadUpdated: (
      squad: SquadRecord,
      added: string[],
      removed: string[]
    ) => void;
    onDragStart?: (unit: Unit, x: number, y: number, chara: Chara) => void;
    onDragEnd?: (chara: Chara) => (x: number, y: number) => void;
  }
) => {
  const container = scene.add.container(x, y);
  const tiles = createTiles(scene, scale, {
    mapWidth: 3,
    mapHeight: 3,
  });
  container.add(tiles.map((t) => t.sprite));
  const board: Board = {
    scene,
    container,
    tiles,
    unitList: [],
    front,
    isSelected,
    units,
    squad,
    x,
    y,
    scale,
    destroy: () => container.destroy(),
  };

  placeUnits(board);

  if (interactive) {
    const { onSquadUpdated, onDragStart, onDragEnd } = interactive;
    makeUnitsDragable(board, onSquadUpdated, onDragStart, onDragEnd);
  }
  // DEBUG DRAG CONTAINER
  //debugMakeOverlay(board);

  return board;
};
