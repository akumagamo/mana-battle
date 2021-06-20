import * as optionsButtonClicked from "./optionsButtonClicked";
import * as newGameButtonClicked from "./NewGameButtonClicked";
import { Map } from "immutable";

const events = Map({
  [optionsButtonClicked.key]: optionsButtonClicked.OptionsButtonClicked,
  [newGameButtonClicked.key]: newGameButtonClicked.NewGameButtonClicked,
});

export const unSubscribe = (scene: Phaser.Scene) =>
  events.keySeq().forEach((k) => scene.events.off(k));

export default events;
