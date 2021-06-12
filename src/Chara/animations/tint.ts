import { Chara } from "../Chara";

export default (chara: Chara, value: number) => {
  chara.container.iterate(
    (child: Phaser.GameObjects.Image | Phaser.GameObjects.Container) => {
      if (child.type === "Container") {
        (child as Phaser.GameObjects.Container).iterate(
          (grand: Phaser.GameObjects.Image) => {
            grand.setTint(Phaser.Display.Color.GetColor(value, value, value));
          }
        );
      } else {
        (child as Phaser.GameObjects.Image).setTint(
          Phaser.Display.Color.GetColor(value, value, value)
        );
      }
    }
  );
};
