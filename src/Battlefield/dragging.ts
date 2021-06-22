import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../constants";
import { Image, Pointer } from "../Models";
import { delay } from "../Scenes/utils";
import {disableCellClick, enableCellClick} from "./board/input";
import { cellSize } from "./config";
import { MapScene } from "./MapScene";

export function setWorldBounds(scene: MapScene) {
  const rows = scene.state.cells[0].length;
  const cols = scene.state.cells.length;
  scene.bounds = {
    x: { min: -1 * (rows * cellSize - SCREEN_WIDTH), max: 0 },
    y: { min: -1 * (cols * cellSize - SCREEN_HEIGHT), max: 0 },
  };
}

export function makeWorldDraggable(scene: MapScene) {
  scene.mapContainer.setSize(
    scene.mapContainer.getBounds().width,
    scene.mapContainer.getBounds().height
  );

  scene.mapContainer.setInteractive();

  scene.input.setDraggable(scene.mapContainer);

  scene.input.on(
    "drag",
    (_: Pointer, gameObject: Image, dragX: number, dragY: number) => {
      if (scene.dragDisabled) return;

      if (!scene.isDragging) scene.isDragging = true;

      const dx = gameObject.x - dragX;
      const dy = gameObject.y - dragY;

      const mx = scene.mapX - dx;
      const my = scene.mapY - dy;

      const { x, y } = scene.bounds;

      if (mx < x.max && mx > x.min && my < y.max && my > y.min)
        scene.mapContainer.setPosition(scene.mapX - dx, scene.mapY - dy);
      else {
        // Movement bound to one or two corners
        const gx = mx > x.max ? x.max : mx < x.min ? x.min : scene.mapX - dx;
        const gy = my > y.max ? y.max : my < y.min ? y.min : scene.mapY - dy;

        scene.mapContainer.setPosition(gx, gy);
      }
    }
  );

  scene.input.on("dragend", async (pointer: Pointer) => {
    const timeDelta = pointer.upTime - pointer.downTime;
    const posDelta =
      Math.abs(pointer.upX - pointer.downX) +
      Math.abs(pointer.upY - pointer.downY);
    const minTimeDelta = 300;
    const minPosDelta = 30;

    scene.mapX = scene.mapContainer.x;
    scene.mapY = scene.mapContainer.y;
    // Avoid firing "click_cell" event on dragend

    // todo: there's a "distance" property in the Phaser event
    if (
      scene.isDragging &&
      timeDelta > minTimeDelta &&
      posDelta > minPosDelta
    ) {
      disableCellClick(scene);
      await delay(scene, 20);
      enableCellClick(scene);
    }
    scene.isDragging = false;
  });
}
