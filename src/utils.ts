import { Vector } from "matter";

export const indexById = (list: { id: string }[]) =>
  list.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});

export const maybeZero = (v: number | undefined | null) => (v ? v : 0);

export function randomItem<T>(items: Array<T>): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getDistance(a: Vector, b: Vector) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
