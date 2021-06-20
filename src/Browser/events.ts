import { Pointer } from "../Models";
import { createEvent } from "../utils";

export const PointerDown = (obj: Phaser.GameObjects.GameObject) =>
  createEvent<Pointer>(obj, "pointerdown");
