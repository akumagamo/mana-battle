import * as newGameButtonClicked from "./newGameButtonClicked";
import * as optionsButtonClicked from "./optionsButtonClicked";

const events = {
  [newGameButtonClicked.key]: newGameButtonClicked.NewGameButtonClicked,
  [optionsButtonClicked.key]: optionsButtonClicked.OptionsButtonClicked,
};

export const unSubscribe = (scene: Phaser.Scene) =>
  Object.keys(events).forEach((k) => scene.events.off(k));

export default events;
