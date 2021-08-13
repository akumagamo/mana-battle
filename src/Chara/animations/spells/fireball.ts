import { Scene } from "phaser";

export default (scene: Scene, x: number, y: number) => {

  const sprite = scene.add.sprite(x, y, "fire");
  sprite.play("fireball");
  sprite.setScale(2);
  sprite.setRotation(2);

  return sprite;
};
