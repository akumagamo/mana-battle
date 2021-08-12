import createChara from "../Chara/createChara";
import { Chara } from "../Chara/Model";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";
import { createUnitSquadIndex, getMember, getSquad } from "../Squad/Model";
import { getUnit } from "../Unit/Model";
import { CombatCreateParams } from "./Model";

export default async (data: CombatCreateParams, scene: Phaser.Scene) => {
  const state = {
    squads: data.squads,
    unitIndex: data.units,
    unitSquadIndex: createUnitSquadIndex(data.squads),
    charas: [] as Chara[],
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

        const pos = getMember(member.id, squad);
        const bX = isLeftSquad ? 210 : 1080;
        const bY = 120;
        const chara = createChara({
          scene: scene,
          unit,
          x: bX + pos.x * (110 * (isLeftSquad ? 1 : -1)),
          y: bY + pos.y * 80,
          scale: 2,
        });
        chara.stand();

        if (!isLeftSquad) chara.container.scaleX = chara.container.scaleX * -1;

        state.charas.push(chara);
      });
  });

  //this.turn();
};
