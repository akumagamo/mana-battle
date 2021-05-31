import { Vector } from "./Map/Model";

export const indexById = (list: { id: string }[]) =>
  list.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});

export const maybeZero = (v: number | undefined | null) => (v ? v : 0);

export function randomItem<T>(items: Array<T>): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getDistance(a: Vector, b: Vector) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
export type EventFactory<ARGS> = {
  on: (callback: (args_: ARGS) => void) => void;
  once: (callback: (args_: ARGS) => void) => void;
  emit: (args: ARGS) => void;
};

export const SceneEventFactory = <ARGS>(
  scene: Phaser.Scene,
  key: string
): EventFactory<ARGS> => ({
  on: (callback: (args_: ARGS) => void) => {
    scene.events.on(key, callback);
  },
  once: (callback: (args_: ARGS) => void) => {
    scene.events.once(key, callback);
  },
  emit: (args: ARGS) => {
    scene.events.emit(key, args);
  },
});
