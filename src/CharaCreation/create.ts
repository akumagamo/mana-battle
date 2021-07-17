import { HAIR_COLORS, SKIN_COLORS } from "../Chara/animations/constants";
import { GAME_SPEED } from "../env";
import { classes } from "../Unit/Jobs/Jobs";
import { genderLabels, genders, HAIR_STYLES } from "../Unit/Model";
import { CharaCreationState, initialUnit } from "./Model";
import background from "./rendering/background";
import Chara from "./rendering/Chara";
import confirmButton from "./rendering/confirmButton";
import createRadio from "./rendering/formField/radio";
import createFormField from "./rendering/formField/select";
import nameInput from "./rendering/nameInput";
import refreshChara from "./rendering/refreshChara";

export default function (scene: Phaser.Scene) {
  if (process.env.SOUND_ENABLED) {
    scene.sound.stopAll();
    const music = scene.sound.add("jshaw_dream_of_first_flight");
    music.play();
  }
  scene.cameras.main.fadeIn(1000 / GAME_SPEED);

  const state: CharaCreationState = {
    unit: initialUnit,
    container: scene.add.container(),
    chara: Chara(scene, initialUnit),
  };

  background(scene, state);

  nameInput(scene, 430, 50);

  genderInput(scene, state);

  skinColorInput(scene, state);

  hairColorInput(scene, state);

  hairStyleInput(scene, state);

  classInput(scene, state);

  confirmButton(scene, state);

  scene.game.events.emit("CharaCreationSceneCreated", { scene, state });
}
function classInput(scene: Phaser.Scene, state: CharaCreationState) {
  createRadio(
    scene,
    state.container,
    430,
    550,
    570,
    "Class",
    "class",
    classes,
    { fighter: "Fighter", archer: "Archer", mage: "Mage" },
    (a: any, b: any) => {
      state.unit = { ...state.unit, [a]: b };
      refreshChara(scene, state);
    }
  );
}

function hairStyleInput(scene: Phaser.Scene, state: CharaCreationState) {
  createFormField(
    scene,
    state.container,
    430,
    50 + 120 * 3,
    0,
    "Hair Style",
    "hair",
    HAIR_STYLES,
    (u) => {
      state.unit.style = { ...state.unit.style, ...u };
      refreshChara(scene, state);
    }
  );
}

function hairColorInput(scene: Phaser.Scene, state: CharaCreationState) {
  createFormField(
    scene,
    state.container,
    430,
    50 + 120 * 2,
    0,
    "Hair Color",
    "hairColor",
    HAIR_COLORS,
    (u) => {
      state.unit.style = { ...state.unit.style, ...u };
      refreshChara(scene, state);
    }
  );
}

function skinColorInput(scene: Phaser.Scene, state: CharaCreationState) {
  createFormField(
    scene,
    state.container,
    430,
    50 + 120,
    0,
    "Skin Color",
    "skinColor",
    SKIN_COLORS,
    (u) => {
      state.unit.style = { ...state.unit.style, ...u };
      refreshChara(scene, state);
    }
  );
}

function genderInput(scene: Phaser.Scene, state: CharaCreationState) {
  createRadio(
    scene,
    state.container,
    730,
    50,
    380,
    "Gender",
    "gender",
    genders,
    genderLabels,
    (a: any, b: any) => {
      state.unit = { ...state.unit, [a]: b };
      refreshChara(scene, state);
    }
  );
}