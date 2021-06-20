import button from "../../UI/button";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants";
import { makeUnit } from "../../Unit/makeUnit";
import createChara from "../../Chara/createChara";
import { TitleSceneState } from "./Model";
import { turnOff } from "./turnOff";
import { changeMusic } from "./changeMusic";
import { requestFullscreen } from "../../Browser/requestFullscreen";
import {
  handleNewGameButtonClicked,
  NewGameButtonClicked,
} from "./events/NewGameButtonClicked";
import {
  handleOptionButtonClicked,
  OptionsButtonClicked,
} from "./events/optionsButtonClicked";

export function create(scene: Phaser.Scene, state: TitleSceneState) {
  scene.events.once("shutdown", () => turnOff(scene, state));

  NewGameButtonClicked(scene).once(handleNewGameButtonClicked);
  OptionsButtonClicked(scene).once(handleOptionButtonClicked);

  state.container = scene.add.container(0, 0);
  const bg = scene.add.image(0, 0, "backgrounds/sunset");
  bg.setOrigin(0, 0);
  bg.displayWidth = SCREEN_WIDTH;
  bg.displayHeight = SCREEN_HEIGHT;
  state.container.add(bg);

  state.charas = [
    createChara({
      parent: scene,
      unit: makeUnit({ job: "fighter", id: 3, lvl: 1 }),
      x: 250,
      y: 500,
      scale: 1.3,
      front: false,
      showWeapon: false,
    }),
    createChara({
      parent: scene,
      unit: makeUnit({ job: "mage", id: 1, lvl: 1 }),
      x: 350,
      y: 520,
      scale: 1.5,
      front: false,
      showWeapon: false,
    }),
    createChara({
      parent: scene,
      unit: makeUnit({ job: "archer", id: 2, lvl: 1 }),
      x: 450,
      y: 550,
      scale: 1.6,
      front: false,
      showWeapon: false,
    }),
  ];

  state.charas.forEach((c) => {
    c.container.scaleX = c.container.scaleX * -1;
  });
  state.charas.forEach((c) => state.container.add(c.container));

  changeMusic(scene, state, "title");

  button(20, 650, "Go Fullscreen", state.container, scene, () => {
    requestFullscreen();
  });

  button(SCREEN_WIDTH / 2, 550, "New Game", state.container, scene, () =>
    NewGameButtonClicked(scene).emit({ scene, state })
  );

  button(SCREEN_WIDTH / 2, 620, "Options", state.container, scene, () => {
    OptionsButtonClicked(scene).emit(scene);
  });

  scene.game.events.emit("TitleSceneCreated", scene);
}
