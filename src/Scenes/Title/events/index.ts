import * as optionsButtonClicked from "./optionsButtonClicked";
import * as newgamebtn from "./newgamebtn";

export default [newgamebtn.key, optionsButtonClicked.key];

export const subscribe = (scene: Phaser.Scene) => {
  optionsButtonClicked.subscribe(scene);
  newgamebtn.subscribe(scene);
};
