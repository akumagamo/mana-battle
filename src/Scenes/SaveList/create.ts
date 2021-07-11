import chapter1 from "../../Campaign/chapter1";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import button from "../../UI/button";
import {createUnit} from "../../Unit/Model";
import {skillsIndex} from "../../Unit/Skills";
import { SaveFile } from "./Model";

export function create(scene: Phaser.Scene) {
  const container = scene.add.container();

  // background with books and candles

  const saves = JSON.parse(localStorage.getItem("saves") || "[]") as SaveFile[];

  saves.forEach((save, i) => {
    button(
      100,
      100 + i * 100,
      `${save.hero.name} - ${new Date(save.date).toDateString()}`,
      container,
      scene,
      () => {
        let unit = save.hero
        chapter1(scene, unit)
      },
      false,
      300
    );
  });

  button(
    SCREEN_WIDTH - 200,
    SCREEN_HEIGHT - 100,
    "Return to title",
    container,
    scene,
    () => {
      scene.scene.start("TitleScene");
    }
  );

  scene.game.events.emit("SaveListSceneCreated", scene);
}
