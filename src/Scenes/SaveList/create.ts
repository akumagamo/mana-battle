import chapter1 from "../../Campaign/chapter1";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import button from "../../UI/button";
import text from "../../UI/text";
import { SaveFile } from "./Model";

export function create(scene: Phaser.Scene) {
  const container = scene.add.container();

  // background with books and candles

  text( 100, 100, "Continue Game", container, scene)

  const saves = JSON.parse(localStorage.getItem("saves") || "[]") as SaveFile[];

  saves.forEach((save, i) => {
    button(
      100,
      200 + i * 60,
      `${save.hero.name} - ${new Date(save.date).toDateString()}`,
      container,
      scene,
      () => {
        scene.children.removeAll();
        let unit = save.hero;
        chapter1(scene, unit);
      },
      false,
      300
    );
  });

  button(
    SCREEN_WIDTH - 220,
    SCREEN_HEIGHT - 60,
    "Return to title",
    container,
    scene,
    () => {
      scene.children.removeAll();
      scene.scene.start("TitleScene");
    }
  );

  scene.game.events.emit("SaveListSceneCreated", scene);
}
