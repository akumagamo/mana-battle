import { SquadRecord } from '../Squad/Model';
import { UnitIndex } from '../Unit/Model';
import { StaticBoard } from './Model';
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
  isSelected = false
) => {

  const container = scene.add.container(x, y);
  const tiles = createTiles(scene, scale, {
    mapWidth: 3,
    mapHeight: 3,
  });
  container.add(tiles.map((t) => t.sprite));
  const board: StaticBoard = {
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

  // DEBUG DRAG CONTAINER
  //debugMakeOverlay(board);

  return board;
};
