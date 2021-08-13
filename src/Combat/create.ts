import createChara from "../Chara/createChara";
import { emptyIndex } from "../Chara/Model";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";
import { createUnitSquadIndex, getMember, getSquad } from "../Squad/Model";
import { getUnit } from "../Unit/Model";
import {
  memberToBoardPosition,
  placeUnitOnBoard,
  renderPieceOnCell,
} from "./combatBoard";
import execute from "./execute";
import { CombatBoardState, CombatCreateParams } from "./Model";
import { runCombat } from "./turns";

export default async (data: CombatCreateParams, scene: Phaser.Scene) => {
  const state: CombatBoardState = {
    left: data.left,
    scene,
    squadIndex: data.squads,
    unitIndex: data.units,
    unitSquadIndex: createUnitSquadIndex(data.squads),
    charaIndex: emptyIndex,
  };

  if (process.env.SOUND_ENABLED) {
    scene.sound.stopAll();
    const music = scene.sound.add("combat1");
    music.play();
  }

  const combatants = [data.left, data.right];

  const board = scene.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "board");

  board.alpha = 0.8;

  combatants.forEach((id) => {
    const squad = getSquad(id, data.squads);

    const isLeftSquad = id === data.left;

    squad.members
      .sort((a, b) => a.y - b.y)
      .forEach((member) => {
        const unit = getUnit(member.id, data.units);

        if (unit.currentHp < 1) return;

        const position = placeUnitOnBoard(isLeftSquad)(squad)(member.id);

        const chara = createChara({
          scene: scene,
          unit,
          ...position,
          scale: 2,
        });
        chara.stand();

        if (!isLeftSquad) chara.container.scaleX = chara.container.scaleX * -1;

        state.charaIndex = state.charaIndex.set(chara.id, chara);
      });
  });
  const commands = runCombat(state);
  execute(commands, state);

  //this.turn();
};
