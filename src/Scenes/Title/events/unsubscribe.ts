import * as optionsButtonClicked from "./optionsButtonClicked";
import * as newgamebtn from "./newgamebtn";

const events = [newgamebtn.key, optionsButtonClicked.key];

export default (scene: Phaser.Scene) =>
  events.forEach((k) => scene.events.off(k));
