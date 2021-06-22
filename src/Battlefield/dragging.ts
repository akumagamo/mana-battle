import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';
import { Image, Pointer } from '../Models';
import { delay } from '../Scenes/utils';
import { disableCellClick, enableCellClick } from './board/input';
import { cellSize } from './config';
import { MapScene } from './MapScene';

export function setWorldBounds(scene: MapScene) {
  const rows = scene.state.cells[0].length;
  const cols = scene.state.cells.length;
  scene.state.bounds = {
    x: { min: -1 * (rows * cellSize - SCREEN_WIDTH), max: 0 },
    y: { min: -1 * (cols * cellSize - SCREEN_HEIGHT), max: 0 },
  };
}

export function makeWorldDraggable(scene: MapScene) {
  scene.state.mapContainer.setSize(
    scene.state.mapContainer.getBounds().width,
    scene.state.mapContainer.getBounds().height
  );

  scene.state.mapContainer.setInteractive();

  scene.input.setDraggable(scene.state.mapContainer);

  scene.input.on(
    'drag',
    (_: Pointer, gameObject: Image, dragX: number, dragY: number) => {
      if (scene.state.dragDisabled) return;

      if (!scene.state.isDragging) scene.state.isDragging = true;

      const dx = gameObject.x - dragX;
      const dy = gameObject.y - dragY;

      const mx = scene.state.mapX - dx;
      const my = scene.state.mapY - dy;

      const { x, y } = scene.state.bounds;

      if (mx < x.max && mx > x.min && my < y.max && my > y.min)
        scene.state.mapContainer.setPosition(
          scene.state.mapX - dx,
          scene.state.mapY - dy
        );
      else {
        // Movement bound to one or two corners
        const gx =
          mx > x.max ? x.max : mx < x.min ? x.min : scene.state.mapX - dx;
        const gy =
          my > y.max ? y.max : my < y.min ? y.min : scene.state.mapY - dy;

        scene.state.mapContainer.setPosition(gx, gy);
      }
    }
  );

  scene.input.on('dragend', async (pointer: Pointer) => {
    const timeDelta = pointer.upTime - pointer.downTime;
    const posDelta =
      Math.abs(pointer.upX - pointer.downX) +
      Math.abs(pointer.upY - pointer.downY);
    const minTimeDelta = 300;
    const minPosDelta = 30;

    scene.state.mapX = scene.state.mapContainer.x;
    scene.state.mapY = scene.state.mapContainer.y;
    // Avoid firing "click_cell" event on dragend

    // todo: there's a "distance" property in the Phaser event
    if (
      scene.state.isDragging &&
      timeDelta > minTimeDelta &&
      posDelta > minPosDelta
    ) {
      disableCellClick(scene);
      await delay(scene, 20);
      enableCellClick(scene);
    }
    scene.state.isDragging = false;
  });
}
