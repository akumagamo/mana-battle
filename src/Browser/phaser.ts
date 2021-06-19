import { Container } from "../Models";

export const createContainer = (scene: Phaser.Scene, x = 0, y = 0) =>
  scene.add.container(x, y);

export const addChildToContainer = (
  container: Container,
  child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]
) => container.add(child);
