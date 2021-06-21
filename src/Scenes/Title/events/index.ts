import * as optionsButtonClicked from "./optionsButtonClicked";
import * as newgamebtn from "./newGameButtonClicked";

export const events = [newgamebtn.key, optionsButtonClicked.key];

export const subscribeToEvents = (scene: Phaser.Scene) => {
  optionsButtonClicked.subscribe(scene);
  newgamebtn.subscribe(scene);
};

export const emitter = (scene: Phaser.Scene) => ({
  [newgamebtn.key]: newgamebtn.NewGameButtonClicked_(scene).emit,
  [optionsButtonClicked.key]: optionsButtonClicked.OptionsButtonClicked(scene)
    .emit,
});
