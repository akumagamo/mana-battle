import { Chara } from "../Chara/Model";
import { SquadRecord } from "../Squad/Model";
import { Unit, UnitIndex } from "../Unit/Model";
import makeUnitsDragable from "./makeUnitsDragable";
import { Board } from "./Model";
import createTiles from "./placeTiles";
import placeUnits from "./placeUnits";

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
  const tileContainer = scene.add.container().setName("tileContainer");
  tileContainer.add(tiles.map((t) => t.sprite));
  container.add(tileContainer);
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

  return {
    board,
    /** Interaction parameters that were used when creating the board are returned to allow other
     * functions refreshing new elements as they are added to the board
     */
    interactions: interactive ? { ...interactive } : null,
  };
};
