import button from "../../UI/button";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../../constants";
import createUnit from "../../Unit/createUnit";
import createChara from "../../Chara/createChara";
import { TitleSceneState } from "./Model";
import { turnOff } from "./turnOff";
import { changeMusic } from "./changeMusic";
import { requestFullscreen } from "../../Browser/requestFullscreen";
import { emitter, subscribeToEvents } from "./events";

export function create(scene: Phaser.Scene, state: TitleSceneState) {
  scene.events.once("shutdown", () => turnOff(scene, state));

  const emit = emitter(scene);

  subscribeToEvents(scene);

  state.container = scene.add.container(0, 0);
  const bg = scene.add.image(0, 0, "backgrounds/sunset");
  bg.setOrigin(0, 0);
  bg.displayWidth = SCREEN_WIDTH;
  bg.displayHeight = SCREEN_HEIGHT;
  state.container.add(bg);

  state.charas = [
    createChara({
      scene: scene,
      unit: createUnit("1", "fighter"),
      x: 250,
      y: 500,
      scale: 1.3,
      front: false,
      showWeapon: false,
    }),
    createChara({
      scene: scene,
      unit: createUnit("1", "mage"),
      x: 350,
      y: 520,
      scale: 1.5,
      front: false,
      showWeapon: false,
    }),
    createChara({
      scene: scene,
      unit: createUnit("2", "archer"),
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
  state.charas.forEach((c) => state.container?.add(c.container));

  changeMusic(scene, state, "title");

  if (localStorage.getItem("saves")) {
    button(SCREEN_WIDTH / 2, 450, "Continue", state.container, scene, () =>
      scene.scene.start("SaveListScene")
    );
  }

  button(SCREEN_WIDTH / 2, 520, "New Game", state.container, scene, () =>
    emit.NewGameButtonClicked({ scene, state })
  );

  button(SCREEN_WIDTH / 2, 590, "Go Fullscreen", state.container, scene, () => {
    requestFullscreen();
  });

  scene.game.events.emit("TitleSceneCreated", scene);
}
