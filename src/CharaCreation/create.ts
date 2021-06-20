import { HAIR_COLORS, SKIN_COLORS } from "../Chara/animations/constants";
import { GAME_SPEED } from "../env";
import { classes, classLabels } from "../Unit/Jobs";
import { genderLabels, genders, HAIR_STYLES } from "../Unit/Model";
import { CharaCreationState, initialUnit } from "./Model";
import background from "./rendering/background";
import Chara from "./rendering/Chara";
import confirmButton from "./rendering/confirmButton";
import { panelHeight } from "./rendering/formPanel";
import nameInput from "./rendering/nameInput";
import propSelector, { baseX, baseY } from "./rendering/propSelector";
import radio from "./rendering/radio";

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

  const prop = (
    y: number,
    label: string,
    prop: "hair" | "hairColor" | "skinColor",
    index: any[]
  ) =>
    propSelector(
      scene,
      state,
      baseX,
      y,
      index.indexOf(state.unit.style[prop]),
      label,
      prop,
      index
    );

  nameInput(scene, state, baseX, baseY);

  radio(
    scene,
    state,
    baseX + 300,
    baseY,
    "Gender",
    "gender",
    genders,
    genderLabels,
    300
  );

  prop(baseY + panelHeight, "Skin Color", "skinColor", SKIN_COLORS);
  prop(baseY + panelHeight * 2, "Hair Color", "hairColor", HAIR_COLORS);
  prop(baseY + panelHeight * 3, "Hair Style", "hair", HAIR_STYLES);

  radio(
    scene,
    state,
    baseX,
    baseY + panelHeight * 4,
    "Class",
    "class",
    classes, // change to initial classes
    classLabels
  );

  confirmButton(scene, state);

  scene.game.events.emit("CharaCreationSceneCreated", {scene, state});
}
