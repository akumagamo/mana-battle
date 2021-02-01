import {
  HAIR_COLOR_WHITE,
  SKIN_COLOR_LIGHT,
} from "../../Chara/animations/constants";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../constants";
import { makeUnit } from "../../Unit/makeUnit";
import { Gender, Unit } from "../../Unit/Model";
import { SceneConfig } from "../Models";

const priest = {
  ...makeUnit("mage", "priest", 1, {}),
  name: "Yordja",
  gender: Gender.Female,
  style: {
    skinColor: SKIN_COLOR_LIGHT,
    hairColor: HAIR_COLOR_WHITE,
    hair: "female2",
    displayHat: false,
  },
};

export default (unit: Unit): SceneConfig => ({
  background: "backgrounds/throne_room",
  steps: [
    {
      type: "CREATE_UNIT",
      unit: priest,
      x: 500,
      y: 200,
      front: true,
      pose: "stand",
      showWeapon: true,
    },
    {
      type: "CREATE_UNIT",
      unit,
      x: SCREEN_WIDTH + 50,
      y: SCREEN_HEIGHT + 50,
      front: false,
      pose: "stand",
      showWeapon: false,
    },
    { type: "WAIT", duration: 500 },
    {
      type: "SPEAK",
      id: priest.id,
      text: `Step forward, new graduate.`,
    },
    { type: "WALK", id: unit.id, x: 800, y: 400 },
    {
      type: "SPEAK",
      id: priest.id,
      text: `Your training as an official is completed.\nFrom now on you will serve as a soldier for the Fahlaar Empire.`,
    },
    {
      type: "SPEAK",
      id: priest.id,
      text: `Before receiving your title, I will ask you some questions.`,
    },
    {
      type: "QUESTION",
      title: "backgound",
      id: priest.id,
      question: `Why did you join the Order's ranks?`,
      options: [
        { answer: "I want to restore my family's name.", value: 1 },
        { answer: "I was raised by the Order.", value: 2 },
        { answer: "I want to bring glory to the Empire.", value: 4 },
      ],
    },
    {
      type: "QUESTION",
      title: "spell_affinity",
      id: priest.id,
      question: `You find a powerful magic scroll. What you do with it?`,
      options: [
        { answer: "I keep it for myself.", value: 0.5 },
        { answer: "I study it.", value: 0 },
        { answer: "I sell it.", value: 1 },
      ],
    },
    {
      type: "QUESTION",
      title: "order_chaos",
      id: priest.id,
      question: `Your family elders advise you against your life's choices. Do you follow their advice?`,
      options: [
        { answer: "They know what is the best for me.", value: 0 },
        { answer: "I try understand their argments.", value: 1 },
        { answer: `They don't know better than me.`, value: 2 },
      ],
    },
    {
      type: "QUESTION",
      title: "protector_element",
      id: priest.id,
      question: `Who would call upon for help?`,
      options: [
        { answer: "The raging flame.", value: 0 },
        { answer: "The blinding light.", value: 1 },
        { answer: "The shards of ice.", value: 2 },
        { answer: "The might of earth.", value: 3 },
      ],
    },
    {
      type: "SPEAK",
      id: priest.id,
      text: `With those answers, I shall put together some folks to accompany your journey.`,
    },
    {
      type: "SPEAK",
      id: priest.id,
      text: `Let the Sun's Light guide your path.`,
    },
    { type: "WAIT", duration: 500 },
    { type: "FLIP", unit },
    { type: "WAIT", duration: 100 },
    {
      type: "WALK",
      id: unit.id,
      x: SCREEN_WIDTH,
      y: SCREEN_HEIGHT,
    },

    { type: "FINISH" },
  ],
});
